const axios = require('axios');

const DEFAULT_BASE_URL = 'https://api.portaldatransparencia.gov.br/api-de-dados/licitacoes';
const BASE_URL = process.env.PORTAL_TRANSPARENCIA_LICITACOES_URL || DEFAULT_BASE_URL;
// Fallback key provided by user for "compras governamentais" (Portal da Transparência matches chave-api-dados)
const API_KEY = process.env.PORTAL_TRANSPARENCIA_API_KEY || '2d56e224c48183a794e0c0642df64f62';

const MAX_PAGES = Number(process.env.PORTAL_TRANSPARENCIA_PAGES || 3);
const CONCURRENT_LIMIT = Number(process.env.PORTAL_TRANSPARENCIA_CONCURRENCY || 3);
const REQUEST_TIMEOUT = Number(process.env.PORTAL_TRANSPARENCIA_TIMEOUT_MS || 30000); // Increased to 30s

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

const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

const buildDateRange = (dateStart, dateEnd) => {
    if (dateStart && dateEnd) {
        return { dataInicial: dateStart, dataFinal: dateEnd };
    }
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 90);
    return { dataInicial: formatDate(past), dataFinal: formatDate(today) };
};

const mapItem = (item) => {
    const objeto = pick(item, [
        'objeto',
        'descricao',
        'descricaoObjeto',
        'objetoLicitacao',
        'objetoCompra'
    ], 'Sem objeto definido');

    const orgao = pick(item, [
        'orgao',
        'nomeOrgao',
        'orgaoEntidade',
        'unidadeGestora',
        'nomeUnidadeGestora'
    ], 'Órgão não informado');

    const uf = pick(item, ['uf', 'siglaUf', 'ufSigla', 'unidadeGestoraSiglaUf'], 'N/A');
    const municipio = pick(item, ['municipio', 'nomeMunicipio', 'municipioNome'], 'N/A');
    const modalidade = pick(item, ['modalidade', 'modalidadeLicitacao', 'modalidadeContratacaoNome'], 'N/A');
    const dataPublicacao = pick(item, ['dataPublicacao', 'dataPublicacaoPncp', 'dataAbertura', 'dataInicio'], null);

    const id = pick(item, ['id', 'codigoLicitacao', 'numeroLicitacao', 'numeroProcesso'], null);
    const link = pick(item, ['link', 'url', 'urlDetalhe'], 'https://portaldatransparencia.gov.br/licitacoes');

    return {
        id: id || `${item?.numeroProcesso || ''}-${item?.dataPublicacao || ''}`,
        objeto,
        orgao,
        uf,
        municipio,
        modalidade,
        dataPublicacao,
        link,
        fonte: 'Portal da Transparência',
        source: 'pt',
        linkLabel: 'Ver no Portal'
    };
};

const portalTransparenciaService = {
    searchTenders: async (params) => {
        if (!API_KEY) {
            return { total: 0, pages: 0, data: [] };
        }

        const { q, page } = params;
        const { dataInicial, dataFinal } = buildDateRange(params.dateStart, params.dateEnd);

        const fetchPage = async (pageNum) => {
            const query = {
                pagina: pageNum,
                dataInicial,
                dataFinal
            };
            const headers = { 'chave-api-dados': API_KEY };
            return http.get(BASE_URL, { params: query, headers })
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
            if (Array.isArray(r.data)) allItems = allItems.concat(r.data);
            if (r.data && Array.isArray(r.data.data)) allItems = allItems.concat(r.data.data);
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

module.exports = portalTransparenciaService;
