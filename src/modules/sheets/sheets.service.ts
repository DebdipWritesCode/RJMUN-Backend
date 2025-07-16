import { Injectable, OnModuleInit } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class SheetsService implements OnModuleInit {
  private sheets: any;

  async onModuleInit() {
    const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!raw) {
      throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.');
    }

    let credentials;
    try {
      credentials = JSON.parse(raw);
    } catch (err) {
      throw new Error('Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS_JSON env variable.');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
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
