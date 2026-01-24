
'use client';

import { useState } from 'react';

export default function CredentialGenerator() {
    const [jsonInput, setJsonInput] = useState('');
    const [base64Output, setBase64Output] = useState('');

    const handleGenerate = () => {
        try {
            // Validate JSON first
            JSON.parse(jsonInput);
            // Encode
            // Encode
            // Use browser-safe base64 encoding (btoa handles Latin1, so we escape utf-8 first)
            const simpleEncoded = btoa(unescape(encodeURIComponent(jsonInput)));
            setBase64Output(simpleEncoded);
        } catch (e) {
            alert('Invalid JSON! Please paste the full content of your credentials file.');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold mb-1">
                    Paste your specific JSON service account file content here:
                </label>
                <textarea
                    className="w-full h-32 p-2 border rounded text-xs font-mono"
                    placeholder='{"type": "service_account", ...}'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />
            </div>

            <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
                Generate Safe Base64 String
            </button>

            {base64Output && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-bold text-green-700 mb-2">✓ Success! Copy the string below:</p>
                    <div className="relative">
                        <textarea
                            className="w-full h-24 p-2 border bg-white text-xs break-all"
                            readOnly
                            value={base64Output}
                            onClick={(e) => e.currentTarget.select()}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        <strong>Next Step:</strong> Go to Vercel, create a NEW variable called
                        <code className="bg-gray-200 px-1 mx-1 rounded">GOOGLE_SERVICE_ACCOUNT_JSON</code>
                        and paste this long string as the value.
                    </p>
                </div>
            )}
        </div>
    );
}
