const axios = require('axios');

const ENDPOINTS = [
    { url: 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao', method: 'GET' },
    { url: 'https://pncp.gov.br/api/pncp/v1/contratacoes', method: 'GET' },
    { url: 'https://pncp.gov.br/api/search/v1/contratacoes', method: 'GET' },
    { url: 'https://pncp.gov.br/api/consulta/v1/contratacoes', method: 'GET' },
    { url: 'https://pncp.gov.br/api/pncp/v1/orgaos/entradas', method: 'GET' }
];

const PARAMS = {
    dataInicial: '20260101',
    dataFinal: '20260201',
    pagina: 1,
    tamanhoPagina: 1
};

async function probe() {
    console.log('--- Probing Alternate Endpoints ---');
    for (const ep of ENDPOINTS) {
        try {
            console.log(`Testing ${ep.method} ${ep.url}`);

            const res = await axios({
                method: ep.method,
                url: ep.url,
                params: { ...PARAMS, objeto: 'informatica' }
            });
            console.log(`[HIT] ${ep.url} returned ${res.status}. Data: ${JSON.stringify(res.data).substring(0, 100)}...`);
        } catch (err) {
            console.log(`[MISS] ${ep.url}: ${err.response ? err.response.status : err.message}`);
        }
    }
}

probe();
