import type { Request } from 'express';
import { google, type sheets_v4 } from 'googleapis';
import type GoogleAuthService from './google-auth.service.js';
import { PermissionDeniedError } from '../models/auth-error.mode.js';

export default class GoogleSheetService {
  public constructor(
    private readonly googleAuthService: GoogleAuthService,
  ) { }

  private getSheetsBySessionId(request: Request): sheets_v4.Sheets {
    const client = this.googleAuthService.getAuthorizedClient(request);
    return google.sheets({ version: 'v4', auth: client });
  }

  public async getSheetData(request: Request, spreadsheetId: string, range: string): Promise<string[][]> {
    const sheets = this.getSheetsBySessionId(request);
    const result = await sheets.spreadsheets.values.get({ spreadsheetId, range })
      .catch(() => { throw new PermissionDeniedError() });
    const rows = result.data.values as string[][] | null | undefined;
    if (!rows) throw new Error(`No data found for spreadsheetId: ${spreadsheetId} in range: ${range}`);
    return rows.map((row) => row.map((cell) => cell ?? ''));
  }
}
