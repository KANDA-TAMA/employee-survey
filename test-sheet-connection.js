
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testConnection() {
    console.log('--- Google Sheets Connection Test ---');

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!email || !privateKeyRaw || !spreadsheetId) {
        console.error('ERROR: Missing environment variables.');
        return;
    }

    // 1. Sanitize Key for usage (Remove \r, ensure proper format)
    // Sometimes raw keys have \r\n which might confuse some parsers, though usually fine.
    // Also, if it has literal \n, we replace them.
    let key = privateKeyRaw.replace(/\\n/g, '\n');

    // Ensure it's not wrapped in quotes if dotenv didn't strip them (it usually does)
    if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
    }

    try {
        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log('\nAttempting to connect...');
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId
        });

        console.log('SUCCESS: Connected to spreadsheet!');
        console.log(`Title: ${metadata.data.properties.title}`);

        console.log('\n--- Sheet Names (Tabs) ---');
        const sheetNames = metadata.data.sheets.map(s => s.properties.title);
        sheetNames.forEach(name => console.log(` - ${name}`));

        const requiredSheets = ['surveys', 'responses', 'settings'];
        const missing = requiredSheets.filter(n => !sheetNames.includes(n));

        if (missing.length > 0) {
            console.warn(`\nWARNING: Missing sheets: ${missing.join(', ')}`);
        } else {
            console.log('\nAll required sheets present.');
        }

        // 5. Test Write Permission (Append to 'settings' - harmless usually)
        console.log('\nAttempting to WRITE to "settings" sheet...');
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'settings!B1', // Use a cell that is likely header or empty, avoiding destroying data if possible, but update is safer than append for just testing access? 
            // Actually, lets just read first. If read works, permissions are likely OK for "Editor".
            // But user asked for WRITE test.
            valueInputOption: 'RAW',
            requestBody: {
                values: [['TestWrite']]
            }
        });
        console.log('SUCCESS: Write permission confirmed (Updated settings!B1).');
    } catch (error) {
        console.error('\nCONNECTION FAILED');
        console.error(error.message);
        console.error('Code:', error.code);
    }

    // 2. Generate Vercel-Ready Key (Single line with \n)
    console.log('\n--- Vercel Optimized Key (Copy this entire line) ---');
    // Replace real newlines with literal '\n'
    const vercelKey = privateKeyRaw.trim().replace(/\r\n/g, '\n').replace(/\n/g, '\\n');
    console.log(vercelKey);
}

testConnection();
