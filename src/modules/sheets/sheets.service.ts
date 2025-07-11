import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as credentials from "../../../credentials.json";

@Injectable()
export class SheetsService {
  private sheets: any;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendRegistrationData(row: any[], sheetId: string, range: string) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  }
}
