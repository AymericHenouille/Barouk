import type GoogleSheetService from './google-sheet.service.js';

export default class SpeechService {
  public static readonly SPEECH_SPREAD_SHEET_ID: string = '1RguIJuPPRJkBwg9t9plm3vQGrNOC5-VShUN8iFMCK7U';
  public constructor(
    private readonly googleSheetService: GoogleSheetService,
  ) { }

  public async getSpeechs(sessionID: string): Promise<string> {
    const rows = await this.googleSheetService.getSheetData(
      sessionID,
      SpeechService.SPEECH_SPREAD_SHEET_ID,
      'Discours et Orateurs!A4:D4',
    );
    return rows.map((row) => row.join(' - ')).join('\n');
  }
}
