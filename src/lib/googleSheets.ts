import { google } from 'googleapis';
import { Survey, Response, OrganizationSettings, Question, Answer } from './types';

// Google Sheets API の認証設定
const getAuth = () => {
    // 1. Base64 encoded JSON (Safest for Vercel)
    const base64Creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (base64Creds) {
        try {
            const decoded = Buffer.from(base64Creds, 'base64').toString('utf-8');
            const credentials = JSON.parse(decoded);
            return new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } catch (e) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
        }
    }

    // 2. Legacy: Individual variables
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const keyRaw = process.env.GOOGLE_PRIVATE_KEY;

    if (!email || !keyRaw) {
        throw new Error('Google Sheets credentials are not configured');
    }

    const key = keyRaw.replace(/\\n/g, '\n');

    return new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: key,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
};

const getSheets = () => {
    const auth = getAuth();
    return google.sheets({ version: 'v4', auth });
};

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || '';

// シート名
const SHEETS = {
    SURVEYS: 'surveys',
    RESPONSES: 'responses',
    SETTINGS: 'settings',
};

// ==================== Surveys ====================

export async function getSurveys(): Promise<Survey[]> {
    const sheets = getSheets();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.SURVEYS}!A:H`,
        });

        const allRows = response.data.values || [];
        // Skip header row if present
        const rows = allRows.length > 0 && (allRows[0][0] === 'id' || allRows[0][0] === 'ID')
            ? allRows.slice(1)
            : allRows;

        return rows.map((row) => ({
            id: row[0] || '',
            title: row[1] || '',
            description: row[2] || '',
            questions: JSON.parse(row[3] || '[]') as Question[],
            createdAt: row[4] || '',
            updatedAt: row[5] || '',
            isActive: row[6] === 'true',
        }));
    } catch (error) {
        console.error('Error fetching surveys:', error);
        return [];
    }
}

export async function getSurveyById(id: string): Promise<Survey | null> {
    const surveys = await getSurveys();
    return surveys.find((s) => s.id === id) || null;
}

export async function createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Survey> {
    const sheets = getSheets();
    const now = new Date().toISOString();
    const id = `survey_${Date.now()}`;

    const newSurvey: Survey = {
        ...survey,
        id,
        createdAt: now,
        updatedAt: now,
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.SURVEYS}!A:H`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[
                newSurvey.id,
                newSurvey.title,
                newSurvey.description,
                JSON.stringify(newSurvey.questions),
                newSurvey.createdAt,
                newSurvey.updatedAt,
                String(newSurvey.isActive),
            ]],
        },
    });

    return newSurvey;
}

export async function updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey | null> {
    const sheets = getSheets();
    const surveys = await getSurveys();
    const index = surveys.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const updatedSurvey: Survey = {
        ...surveys[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    const rowIndex = index + 2; // +2 because of header row and 1-indexed

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.SURVEYS}!A${rowIndex}:H${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[
                updatedSurvey.id,
                updatedSurvey.title,
                updatedSurvey.description,
                JSON.stringify(updatedSurvey.questions),
                updatedSurvey.createdAt,
                updatedSurvey.updatedAt,
                String(updatedSurvey.isActive),
            ]],
        },
    });

    return updatedSurvey;
}

export async function deleteSurvey(id: string): Promise<boolean> {
    // Instead of deleting, we set isActive to false
    const result = await updateSurvey(id, { isActive: false });
    return result !== null;
}

// ==================== Responses ====================

export async function getResponses(surveyId?: string): Promise<Response[]> {
    const sheets = getSheets();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.RESPONSES}!A:E`,
        });

        const allRows = response.data.values || [];
        // Skip header row if present
        const rows = allRows.length > 0 && (allRows[0][0] === 'id' || allRows[0][0] === 'ID')
            ? allRows.slice(1)
            : allRows;

        const responses = rows.map((row) => ({
            id: row[0] || '',
            surveyId: row[1] || '',
            respondentName: row[2] || '',
            answers: JSON.parse(row[3] || '[]') as Answer[],
            submittedAt: row[4] || '',
        }));

        if (surveyId) {
            return responses.filter((r) => r.surveyId === surveyId);
        }

        return responses;
    } catch (error) {
        console.error('Error fetching responses:', error);
        return [];
    }
}

export async function createResponse(response: Omit<Response, 'id' | 'submittedAt'>): Promise<Response> {
    const sheets = getSheets();
    const now = new Date().toISOString();
    const id = `response_${Date.now()}`;

    const newResponse: Response = {
        ...response,
        id,
        submittedAt: now,
    };

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.RESPONSES}!A:E`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[
                newResponse.id,
                newResponse.surveyId,
                newResponse.respondentName,
                JSON.stringify(newResponse.answers),
                newResponse.submittedAt,
            ]],
        },
    });

    return newResponse;
}

// ==================== Settings ====================

export async function getSettings(): Promise<OrganizationSettings> {
    const sheets = getSheets();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEETS.SETTINGS}!A:B`,
        });

        const allRows = response.data.values || [];
        // Skip header row if present
        const rows = allRows.length > 0 && (allRows[0][0] === 'name' || allRows[0][0] === 'Name')
            ? allRows.slice(1)
            : allRows;

        const row = rows[0];
        if (row) {
            return {
                name: row[0] || '',
                employees: JSON.parse(row[1] || '[]'),
            };
        }

        return { name: '', employees: [] };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { name: '', employees: [] };
    }
}

export async function updateSettings(settings: OrganizationSettings): Promise<OrganizationSettings> {
    const sheets = getSheets();

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.SETTINGS}!A2:B2`,
        valueInputOption: 'RAW',
        requestBody: {
            values: [[
                settings.name,
                JSON.stringify(settings.employees),
            ]],
        },
    });

    return settings;
}

// ==================== シート初期化 ====================

export async function initializeSheets(): Promise<void> {
    const sheets = getSheets();

    try {
        // スプレッドシートの情報を取得
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

        // 必要なシートを作成
        const sheetsToCreate = Object.values(SHEETS).filter((name) => !existingSheets.includes(name));

        if (sheetsToCreate.length > 0) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: sheetsToCreate.map((title) => ({
                        addSheet: { properties: { title } },
                    })),
                },
            });
        }

        // ヘッダー行を追加
        const headers: Record<string, string[][]> = {
            [SHEETS.SURVEYS]: [['id', 'title', 'description', 'questions', 'createdAt', 'updatedAt', 'isActive']],
            [SHEETS.RESPONSES]: [['id', 'surveyId', 'respondentName', 'answers', 'submittedAt']],
            [SHEETS.SETTINGS]: [['name', 'employees']],
        };

        for (const [sheetName, headerRow] of Object.entries(headers)) {
            if (sheetsToCreate.includes(sheetName)) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: { values: headerRow },
                });
            }
        }

        console.log('Sheets initialized successfully');
    } catch (error) {
        console.error('Error initializing sheets:', error);
        throw error;
    }
}
