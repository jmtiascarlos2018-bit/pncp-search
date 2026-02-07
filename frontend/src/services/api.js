const envBase = (import.meta.env.VITE_API_URL || '').trim();
const fallbackBase = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : '';
let baseUrl = (envBase || fallbackBase).replace(/\/+$/, '');

// Local dev helper: if running frontend on localhost, default backend to :3001
if (!envBase && typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        baseUrl = `${protocol}//${hostname}:3001`;
    }
}
const API_URL = (baseUrl ? baseUrl + '/api' : '/api');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const searchTenders = async (searchParams) => {
    const params = new URLSearchParams();
    if (searchParams.niche) params.append('q', searchParams.niche);
    if (searchParams.uf) params.append('uf', searchParams.uf);
    if (searchParams.dateStart) params.append('dateStart', searchParams.dateStart);
    if (searchParams.dateEnd) params.append('dateEnd', searchParams.dateEnd);
    if (searchParams.page) params.append('page', searchParams.page);
    if (searchParams.sources) params.append('sources', searchParams.sources);

    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // Tentativa de busca
            const response = await fetch(`${API_URL}/search?${params.toString()}`);

            if (response.ok) {
                return await response.json();
            }

            // Se for erro do servidor (5xx) ou cold start, tenta de novo
            // Se for erro do cliente (4xx), para por aqui
            if (response.status < 500) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
        } catch (error) {
            console.log(`Tentativa ${i + 1} falhou. Retentando...`);
            // Se for a última tentativa, lança o erro real
            if (i === MAX_RETRIES - 1) throw error;
            // Espera 2 segundos antes de tentar de novo
            await wait(2000);
        }
    }
};

export const subscribeAlert = async ({ email, q, uf, sources }) => {
    const response = await fetch(`${API_URL}/alerts/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, q, uf, sources })
    });

    if (!response.ok) {
        throw new Error('Erro ao criar alerta');
    }

    return response.json();
};

export const analyzeBid = async (analysisData) => {
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
    });

    if (!response.ok) {
        throw new Error('Erro ao realizar análise');
    }

    return response.json();
};

export const getSystemStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/status`);
        return await response.json();
    } catch (error) {
        console.warn('Could not fetch system status:', error);
        return null;
    }
};
