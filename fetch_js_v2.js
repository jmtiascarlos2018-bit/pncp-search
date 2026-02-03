const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://pncp.gov.br/app/';

async function fetchJS() {
    const files = [
        'main.4767c01986db9b0a.js'
    ];

    for (const file of files) {
        const url = BASE_URL + file;
        console.log(`Fetching ${url}...`);
        try {
            const res = await axios.get(url);
            fs.writeFileSync(file, res.data);
            console.log(`Saved ${file}`);

            // Grep for API
            const content = res.data;
            const apiMatches = content.match(/api\/[^"']+/g) || [];
            console.log('--- API Endpoints Found ---');
            console.log([...new Set(apiMatches)].join('\n'));

            // Grep for http
            const httpMatches = content.match(/https?:\/\/[^"']+/g) || [];
            console.log('--- Full URLs Found ---');
            console.log([...new Set(httpMatches)].filter(u => u.includes('api')).join('\n'));

        } catch (err) {
            console.error(`Failed: ${err.message}`);
        }
    }
}

fetchJS();
