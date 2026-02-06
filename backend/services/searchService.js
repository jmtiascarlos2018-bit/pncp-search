const pncpService = require('./pncpService');
const portalTransparenciaService = require('./portalTransparenciaService');
const comprasGovService = require('./comprasGovService');

const ALL_SOURCES = ['pncp', 'pt', 'comprasgov'];

const normalizeSources = (sourcesParam) => {
    if (!sourcesParam) return ALL_SOURCES;
    const rawParts = String(sourcesParam)
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    if (!rawParts.length) return ALL_SOURCES;

    // alias normalization
    const parts = rawParts.map((s) => {
        if (s === 'compras' || s === 'comprasgovbr' || s === 'cg') return 'comprasgov';
        if (s === 'portal' || s === 'transparencia') return 'pt';
        return s;
    });
    return parts.length ? parts : ALL_SOURCES;
};

const dedupeByKey = (items) => {
    const seen = new Set();
    const out = [];
    for (const item of items) {
        const key = item && (item.id ? `${item.source || item.fonte || 'src'}:${item.id}` : item.link);
        const finalKey = key || JSON.stringify(item);
        if (seen.has(finalKey)) continue;
        seen.add(finalKey);
        out.push(item);
    }
    return out;
};

const searchTenders = async (params) => {
    const sources = normalizeSources(params.sources);
    const tasks = [];
    const sourcesUsed = [];
    const sourcesSkipped = [];

    if (sources.includes('pncp')) {
        sourcesUsed.push('pncp');
        tasks.push(pncpService.searchTenders(params));
    }

    if (sources.includes('pt')) {
        if (!process.env.PORTAL_TRANSPARENCIA_API_KEY) {
            sourcesSkipped.push('pt');
        } else {
            sourcesUsed.push('pt');
            tasks.push(portalTransparenciaService.searchTenders(params));
        }
    }

    if (sources.includes('comprasgov')) {
        sourcesUsed.push('comprasgov');
        tasks.push(comprasGovService.searchTenders(params));
    }

    if (!tasks.length) {
        return {
            total: 0,
            pages: 0,
            data: [],
            sourcesUsed: [],
            sourcesSkipped
        };
    }

    const settled = await Promise.allSettled(tasks);
    const dataSets = [];
    const sourcesFailed = [];

    settled.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            dataSets.push(result.value);
        } else {
            sourcesFailed.push(sourcesUsed[idx]);
        }
    });

    const combined = dataSets.flatMap((r) => r.data || []);
    const deduped = dedupeByKey(combined);

    return {
        total: deduped.length,
        pages: 1,
        data: deduped,
        sourcesUsed,
        sourcesFailed,
        sourcesSkipped
    };
};

module.exports = { searchTenders };
