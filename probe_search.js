const axios = require('axios');

async function probe() {
    console.log('--- Probing Search API ---');
    const URLS = [
        'https://pncp.gov.br/api/search',
        'https://pncp.gov.br/api/search/v1/contratacoes',
        'https://pncp.gov.br/api/search/?q=informatica',
        'https://pncp.gov.br/api/search/v1/contratacoes?q=informatica',
        'https://pncp.gov.br/api/pncp/v1/contratacoes?q=informatica'
    ];

    for (const url of URLS) {
        try {
            console.log(`Testing ${url}`);
            const res = await axios.get(url);
            console.log(`[HIT] ${url} -> ${res.status}`);
        } catch (err) {
            console.log(`[MISS] ${url} -> ${err.response ? err.response.status : err.message}`);
        }
    }
}
probe();
