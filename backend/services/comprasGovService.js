const axios = require('axios');

const DEFAULT_BASE_URL = 'https://compras.dados.gov.br/licitacoes/v1/licitacoes.json';
const BASE_URL = process.env.COMPRAS_GOV_LICITACOES_URL || DEFAULT_BASE_URL;

const MAX_PAGES = Number(process.env.COMPRAS_GOV_PAGES || 2);
const CONCURRENT_LIMIT = Number(process.env.COMPRAS_GOV_CONCURRENCY || 2);
const REQUEST_TIMEOUT = Number(process.env.COMPRAS_GOV_TIMEOUT_MS || 30000); // Increased to 30s
const PAGE_SIZE = Number(process.env.COMPRAS_GOV_PAGE_SIZE || 500);

const http = axios.create({
    timeout: REQUEST_TIMEOUT,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }
});

const normalizeText = (text) =>
    String(text || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const pick = (obj, keys, fallback) => {
    for (const key of keys) {
        if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
        }
    }
    return fallback;
};

const findFirstArray = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    if (Array.isArray(obj)) return obj;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.licitacoes)) return obj.licitacoes;
    if (obj._embedded && typeof obj._embedded === 'object') {
        for (const value of Object.values(obj._embedded)) {
            if (Array.isArray(value)) return value;
        }
    }
    return [];
};

const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

const buildDateRange = (dateStart, dateEnd) => {
    if (dateStart && dateEnd) {
        return { start: dateStart, end: dateEnd };
    }
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 90);
    return { start: formatDate(past), end: formatDate(today) };
};

const mapItem = (item) => {
    const identificador = pick(item, ['identificador', 'id', 'numero_aviso'], null);
    const objeto = pick(item, ['objeto', 'descricao', 'descricaoObjeto'], 'Sem objeto definido');
    const modalidade = pick(item, ['modalidade', 'modalidade_licitacao'], 'N/A');

    const dataPublicacao = pick(item, [
        'data_publicacao',
        'dataPublicacao',
        'data_abertura_proposta'
    ], null);

    const uasg = pick(item, ['uasg'], null);
    const orgao = pick(item, ['orgao', 'orgao_nome', 'nome_orgao'], uasg ? `UASG ${uasg}` : 'Órgão não informado');

    const linkFromApi = item?._links?.self?.href;
    const link = linkFromApi || (identificador ? `https://compras.dados.gov.br/licitacoes/id/licitacao/${identificador}.html` : 'https://compras.dados.gov.br/licitacoes');

    return {
        id: identificador || `${uasg || ''}-${dataPublicacao || ''}-${objeto.slice(0, 30)}`,
        objeto,
        orgao,
        uf: 'N/A',
        municipio: 'N/A',
        modalidade,
        dataPublicacao,
        link,
        fonte: 'Compras.gov.br (Dados Abertos)',
        source: 'comprasgov',
        linkLabel: 'Ver no Compras.gov.br'
    };
};

const comprasGovService = {
    searchTenders: async (params) => {
        const { q, page } = params;
        const { start, end } = buildDateRange(params.dateStart, params.dateEnd);

        const fetchPage = async (pageNum) => {
            const offset = (pageNum - 1) * PAGE_SIZE;
            const query = {
                data_abertura_proposta_min: start,
                data_abertura_proposta_max: end,
                offset
            };
            if (q) query.objeto = q;

            return http.get(BASE_URL, { params: query })
                .catch(() => ({ data: [] }));
        };

        const tasks = [];
        const startPage = page ? Number(page) : 1;
        for (let i = startPage; i < startPage + MAX_PAGES; i++) {
            tasks.push(i);
        }

        const responses = [];
        for (let i = 0; i < tasks.length; i += CONCURRENT_LIMIT) {
            const batch = tasks.slice(i, i + CONCURRENT_LIMIT);
            const batchResults = await Promise.all(batch.map(fetchPage));
            responses.push(...batchResults);
        }

        let allItems = [];
        responses.forEach((r) => {
            const items = findFirstArray(r.data);
            if (items.length) allItems = allItems.concat(items);
        });

        let formattedResults = allItems.map(mapItem);

        if (q) {
            const term = normalizeText(q);
            formattedResults = formattedResults.filter((item) => {
                const haystack = normalizeText(`${item.objeto} ${item.orgao}`);
                return haystack.includes(term);
            });
        }

        return {
            total: formattedResults.length,
            pages: 1,
            data: formattedResults
        };
    }
};

module.exports = comprasGovService;
