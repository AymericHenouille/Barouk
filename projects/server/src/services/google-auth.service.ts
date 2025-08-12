import crypto from 'node:crypto';
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { Request } from 'express';
import type { CustomSessionData } from '../models/session.model.js';
import { AuthentificationRequiredError } from '../models/auth-error.mode.js';

export default class GoogleAuthService {
  public static readonly SCOPES: string[] = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ];

  private readonly clients = new Map<string, OAuth2Client>();

  private createOAuth2Client(): OAuth2Client {
    const credentialsJSON: string = process.env.CREDENTIALS ?? '';
    const credentials = JSON.parse(credentialsJSON);
    const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
    return new google.auth.OAuth2({
      client_id,
      client_secret,
      redirect_uris: redirect_uris,
    });
  }

  public generateAuthUrl(request: Request): string {
    const client = this.createOAuth2Client();
    const state = crypto.randomBytes(32).toString('hex');
    const session = request.session as CustomSessionData;
    session.state = state;
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: GoogleAuthService.SCOPES,
      prompt: 'consent',
      state,
    });
  }

  public async handleOAuthCallBack(request: Request): Promise<void> {
    const { state, code } = request.query;
    const session = request.session as CustomSessionData;
    if (state !== session.state) throw new Error('Invalid state');
    if (typeof code !== 'string') throw new Error('Invalid code type');
    const client = this.createOAuth2Client();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    this.clients.set(request.sessionID, client);
  }

  public async getClientFromRequest(sessionID: string): Promise<OAuth2Client> {
    const client = this.clients.get(sessionID);
    if (client === undefined) throw new AuthentificationRequiredError();
    const tokens = client.credentials;
    const needRefresh = !tokens.expiry_date || tokens.expiry_date <= Date.now() + 60_000;
    if (needRefresh) {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);
    }
    return client;
  }
}
