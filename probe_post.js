const axios = require('axios');

async function probe() {
    console.log('--- Probing POST Search API ---');
    const URL = 'https://pncp.gov.br/api/search';

    const PAYLOADS = [
        { q: 'informatica' },
        { query: 'informatica' },
        { text: 'informatica' },
        { texto: 'informatica' },
        { termo: 'informatica' },
        { keyword: 'informatica' },
        { description: 'informatica' },
        { objeto: 'informatica' }
    ];

    for (const body of PAYLOADS) {
        try {
            console.log(`POST ${URL} with ${JSON.stringify(body)}`);
            const res = await axios.post(URL, body);
            console.log(`[HIT] ${res.status}`);
        } catch (err) {
            console.log(`[MISS] ${err.response ? err.response.status : err.message}`);
        }
    }
}
probe();
