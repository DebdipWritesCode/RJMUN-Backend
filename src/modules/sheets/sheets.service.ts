import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

const SHEETS_RETRY_ATTEMPTS = 5;
const SHEETS_RETRY_DELAY_MS = 10_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class SheetsService {
  private sheets: any;

  /**
   * Runs a Google Sheets API call with retry: up to 5 attempts, 10 seconds between attempts.
   */
  private async withSheetsRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= SHEETS_RETRY_ATTEMPTS; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < SHEETS_RETRY_ATTEMPTS) {
          await sleep(SHEETS_RETRY_DELAY_MS);
        }
      }
    }
    throw lastError;
  }

  constructor() {
    const credentials = {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // fix for escaped \n
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GOOGLE_UNIVERSAL_DOMAIN || 'googleapis.com',
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendRegistrationData(row: any[], sheetId: string, range: string) {
    await this.withSheetsRetry(() =>
      this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      }),
    );
  }

  async updateAllotments(
    sheetId: string,
    allotmentsData: {
      committee: string;
      entries: {
        fullName: string;
        registrationId: string;
        allottedPortfolio: string;
      }[];
    }[],
  ) {
    const spreadsheet = (await this.withSheetsRetry(() =>
      this.sheets.spreadsheets.get({ spreadsheetId: sheetId }),
    )) as { data: { sheets?: Array<{ properties: { title: string } }> } };

    const existingSheets = spreadsheet.data.sheets?.map(
      (s: any) => s.properties.title,
    );

    for (const committeeBlock of allotmentsData) {
      const { committee, entries } = committeeBlock;
      const rows = entries.map((entry) => [
        entry.registrationId,
        entry.fullName,
        entry.allottedPortfolio,
      ]);

      const sheetExists = existingSheets?.includes(committee);

      if (!sheetExists) {
        const addSheetResponse = (await this.withSheetsRetry(() =>
          this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: committee,
                    },
                  },
                },
              ],
            },
          }),
        )) as {
          data: {
            replies?: Array<{
              addSheet?: { properties?: { sheetId?: number } };
            }>;
          };
        };

        await this.withSheetsRetry(() =>
          this.sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${committee}!A1:C1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['Registration ID', 'Full Name', 'Allotted Portfolio']],
            },
          }),
        );

        const sheetIdFromResponse =
          addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;

        if (sheetIdFromResponse !== undefined) {
          await this.withSheetsRetry(() =>
            this.sheets.spreadsheets.batchUpdate({
              spreadsheetId: sheetId,
              requestBody: {
                requests: [
                  {
                    repeatCell: {
                      range: {
                        sheetId: sheetIdFromResponse,
                        startRowIndex: 0,
                        endRowIndex: 1,
                      },
                      cell: {
                        userEnteredFormat: {
                          textFormat: {
                            bold: true,
                          },
                        },
                      },
                      fields: 'userEnteredFormat.textFormat.bold',
                    },
                  },
                  {
                    autoResizeDimensions: {
                      dimensions: {
                        sheetId: sheetIdFromResponse,
                        dimension: 'COLUMNS',
                        startIndex: 0,
                        endIndex: 3,
                      },
                    },
                  },
                ],
              },
            }),
          );
        }
      }

      await this.withSheetsRetry(() =>
        this.sheets.spreadsheets.values.clear({
          spreadsheetId: sheetId,
          range: `${committee}!A2:C`,
        }),
      );

      if (rows.length > 0) {
        await this.withSheetsRetry(() =>
          this.sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${committee}!A2`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: rows,
            },
          }),
        );
      }
    }
  }
}
