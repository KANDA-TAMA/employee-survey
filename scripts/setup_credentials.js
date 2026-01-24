const fs = require('fs');
const path = require('path');

const jsonPath = 'c:\\Users\\kanda\\Downloads\\micro-mediator-484901-m9-c5264b02f816.json';
const envPath = '.env.local';
const outputPath = 'vercel_key_base64.txt';

try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    // Ensure minified json
    const minified = JSON.stringify(JSON.parse(jsonContent));
    const base64 = Buffer.from(minified).toString('base64');

    fs.writeFileSync(outputPath, base64);
    console.log(`Generated ${outputPath}`);

    // Update .env.local
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Comment out old lines or just append new one
    // It's cleaner to remove/comment old Google vars and add the new one
    const newEnvLine = `GOOGLE_SERVICE_ACCOUNT_JSON=${base64}`;

    // Simple append/replace logic
    if (envContent.includes('GOOGLE_SERVICE_ACCOUNT_JSON=')) {
        envContent = envContent.replace(/GOOGLE_SERVICE_ACCOUNT_JSON=.*/g, newEnvLine);
    } else {
        envContent += `\n${newEnvLine}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`Updated ${envPath} with GOOGLE_SERVICE_ACCOUNT_JSON`);

} catch (e) {
    console.error(e);
}
