import crypto from 'node:crypto';
import { google } from 'googleapis';
import { CodeChallengeMethod, OAuth2Client, type Credentials, type OAuth2ClientOptions } from 'google-auth-library';
import type { Request } from 'express';
import type { Options } from '../models/options.model.js';

declare module 'express-session' {
  interface SessionData {
    state: string;
    code: string;
    userId: string;
  }
}

export default class GoogleAuthService {
  public static readonly SCOPES: string[] = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ];

  private _credentials = new Map<string, Credentials>();

  public constructor(
    private readonly _options: Options,
  ) { }

  public generateAuthUrl(request: Request): string {
    const state = crypto.randomBytes(16).toString('base64url');
    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest().toString('base64url');

    request.session['state'] = state;
    request.session['code'] = codeVerifier;
    
    const oauthClient = this.createOAuthClient();
    return oauthClient.generateAuthUrl({
      state,
      access_type: 'offline',
      scope: GoogleAuthService.SCOPES,
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
      include_granted_scopes: true,
    });
  }

  public async handleOAuthCallBack(request: Request): Promise<void> {
    const { code: codeVerifier, state: expectedState } = request.session;
    const { code, state } = request.query;
    
    if (typeof code !== 'string') throw new Error('Missing code in google OAuth callback.');
    if (typeof state !== 'string') throw new Error('Missing state in google OAuth callback.');
    if (!codeVerifier) throw new Error('Missing PKCE code_verifier in session.');
    if (state !== expectedState) throw new Error('Invalid OAuth state.');

    const oauthClient = this.createOAuthClient(); 
    const { tokens } = await oauthClient.getToken({ code, codeVerifier });
    oauthClient.setCredentials(tokens);
    const { data: userinfo } = await google.oauth2({ version: 'v2', auth: oauthClient }).userinfo.get();
    const userId = userinfo.id ?? userinfo.email;
    if (typeof userId !== 'string') throw new Error('Unable to resolve userId (need "openid email" scopes)');

    this._credentials.set(userId, tokens);
    request.session['userId'] = userId;
    delete request.session['state'];
    delete request.session['code'];
    
    return new Promise((resolve, reject) => request.session.save((error) => {
      if (error) return reject(error);
      return resolve();
    }));
  }

  public getAuthorizedClient(request: Request): OAuth2Client {
    const userid = request.session.userId;
    if (typeof userid !== 'string') throw new Error('Unauthenticated.');
    const saved = this._credentials.get(userid);
    if (typeof saved !== 'string') throw new Error('No token found for this user.');
    const client = this.createOAuthClient();
    client.setCredentials(saved);
    return client;
  }

  private createOAuthClient(): OAuth2Client {
    const credentials: OAuth2ClientOptions | undefined = JSON.parse(this._options.GOOGLE_CREDENTIALS)?.web;
    if (typeof credentials !== 'object') throw new Error('Invalid google credentials');
    if (typeof credentials.client_id !== 'string') throw new Error('Invalid google credentials: invalid client_id');
    if (typeof credentials.client_secret !== 'string') throw new Error('Invalid google credentials: invalid client_secret');
    if (typeof credentials.redirect_uris !== 'object') throw new Error('Invalid google credentials: invalid redirect_uris');
    return new OAuth2Client({
      clientId: credentials.client_id ?? '',
      clientSecret: credentials.client_secret ?? '',
      redirectUri: credentials.redirect_uris?.pop() ?? '',
    });
  }
}

