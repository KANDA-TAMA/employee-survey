
import { google } from 'googleapis';
import CredentialGenerator from '@/components/CredentialGenerator';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const keyRaw = process.env.GOOGLE_PRIVATE_KEY || '';
    const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const base64Json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    // 1. Process key exactly as we do in the app
    const processedKey = keyRaw.replace(/\\n/g, '\n');

    const status = {
        base64Json: base64Json ? `Present (Length: ${base64Json.length})` : 'Missing',
        email: email ? `Present (${email})` : 'Missing',
        sheetId: sheetId ? 'Present' : 'Missing',
        legacyKeyLength: keyRaw.length,
    };

    let connectionResult = 'Not Attempted';
    let writeResult = 'Not Attempted';
    let errorDetails = '';
    let writeErrorDetails = '';

    try {
        let auth: any;

        if (base64Json) {
            console.log('Attempting connection with Base64 JSON...');
            try {
                const decoded = Buffer.from(base64Json, 'base64').toString('utf-8');
                const credentials = JSON.parse(decoded);
                auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            } catch (e) {
                errorDetails = 'Failed to decode/parse Base64 JSON';
                throw e;
            }
        } else if (email && keyRaw) {
            console.log('Attempting connection with Legacy Vars...');
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: email,
                    private_key: processedKey,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        }

        if (auth && sheetId) {
            const sheets = google.sheets({ version: 'v4', auth });

            // --- READ TEST ---
            const metadata = await sheets.spreadsheets.get({
                spreadsheetId: sheetId
            });
            connectionResult = "Success! Access confirmed.";
            const sheetTitle = metadata.data.properties?.title || 'Unknown Title';
            connectionResult += ` (Sheet: ${sheetTitle})`;

            // Check Tabs
            const foundTabs = metadata.data.sheets?.map(s => s.properties?.title || '') || [];
            const requiredTabs = ['surveys', 'responses', 'settings'];
            const missingTabs = requiredTabs.filter(t => !foundTabs.includes(t));
            if (missingTabs.length > 0) {
                connectionResult += ` [WARNING] Missing Tabs: ${missingTabs.join(', ')}`;
            }

            // --- WRITE TEST (Simulate Survey Creation) ---
            try {
                const now = new Date().toISOString();
                const testId = `debug_${Date.now()}`;

                await sheets.spreadsheets.values.append({
                    spreadsheetId: sheetId,
                    range: 'surveys!A:H',
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [[
                            testId,
                            'Debug Test Survey',
                            'Created by Debug Page',
                            '[]',
                            now,
                            now,
                            'false'
                        ]]
                    }
                });
                writeResult = "Success! Survey Append Confirmed.";
            } catch (wErr: any) {
                writeResult = "Failed";
                writeErrorDetails = wErr.message;
                if (wErr.code === 403) writeErrorDetails += " (403 Forbidden - Permission Issue?)";
            }

        } else {
            connectionResult = "Skipped (Missing Credentials)";
        }

    } catch (e: any) {
        connectionResult = "Failed";
        // Only overwrite errorDetails if empty (preserve base64 error if needed)
        if (!errorDetails) errorDetails = e.message;
        if (e.code) errorDetails += ` (Code: ${e.code})`;
    }

    return (
        <div className="p-8 font-mono max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Deep Debugger v4</h1>

            {/* --- Utility: Generator --- */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-blue-800 mb-2">① Credential Fixer</h2>
                <CredentialGenerator />
            </div>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">Env Status</h2>
                <pre className="whitespace-pre-wrap text-sm">
                    {JSON.stringify(status, null, 2)}
                </pre>
            </div>

            {/* Connection Result */}
            <div className={`p-4 border rounded mb-4 ${connectionResult.startsWith('Success') ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                <h2 className="font-bold mb-2">1. Connection (Read)</h2>
                <p className="text-lg font-semibold">{connectionResult}</p>
                {errorDetails && <pre className="text-sm text-red-700 mt-2">{errorDetails}</pre>}
            </div>

            {/* Write Result */}
            <div className={`p-4 border rounded ${writeResult.startsWith('Success') ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                <h2 className="font-bold mb-2">2. Permission (Write)</h2>
                <p className="text-lg font-semibold">{writeResult}</p>
                <p className="text-sm text-gray-600 mt-1">Attempts to write a dummy row to 'surveys' sheet.</p>
                {writeErrorDetails && (
                    <div className="mt-2">
                        <p className="font-bold text-red-600">Error Details:</p>
                        <pre className="whitespace-pre-wrap text-sm mt-1 text-gray-800 bg-white p-2 border">
                            {writeErrorDetails}
                        </pre>
                        {writeErrorDetails.includes('403') && (
                            <p className="mt-2 text-sm text-blue-800 font-bold">
                                ➤ Double check correct Email is "Editor" in Share settings.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
