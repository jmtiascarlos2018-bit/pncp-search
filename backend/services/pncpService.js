const axios = require('axios');

const PNCP_BASE_URL = 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao';

/**
 * Service to handle PNCP API interactions
 */
const pncpService = {
    /**
     * Search for tenders (contratações) based on query parameters
     * @param {Object} params - Search parameters (niche, uf, page, etc.)
     * @returns {Promise<Object>} - Formatted API response
     */
    searchTenders: async (params) => {
        try {
            const { q, uf, page = 1, dateStart, dateEnd } = params;

            // Prepare headers/params for PNCP API
            // Date handling: use provided dates or default to last 90 days.
            // Format for API: YYYYMMDD

            let dataInicialStr = '';
            let dataFinalStr = '';

            if (dateStart && dateEnd) {
                dataInicialStr = dateStart.replace(/-/g, '');
                dataFinalStr = dateEnd.replace(/-/g, '');
            } else {
                const today = new Date();
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setDate(today.getDate() - 90);
                const formatDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
                dataInicialStr = formatDate(threeMonthsAgo);
                dataFinalStr = formatDate(today);
            }

            const dataInicial = dataInicialStr;
            const dataFinal = dataFinalStr;

            /* 
             * STRATEGY UPDATE 2:
             * User reported missing results. The API demands a specific modality code.
             * Searching only '6' (Pregão) misses 'Dispensa' (8), 'Concorrência' (4), etc.
             * We will fetch the top 3 modalities in parallel to cover ~90% of cases.
             */

            const MODALITIES = [6, 8, 4]; // 6=Pregão, 8=Dispensa, 4=Concorrência Eletrônica
            const PAGES_TO_FETCH = 30;     // Increased to 30 pages (~4500 items total)
            const ITEMS_PER_PAGE = 50;
            const CONCURRENT_LIMIT = 5;    // Batch requests to distinguish oneself from a DDoS attack

            const fetchPage = async (pageNum, modality) => {
                const params = {
                    pagina: pageNum,
                    tamanhoPagina: ITEMS_PER_PAGE,
                    dataInicial: dataInicial,
                    dataFinal: dataFinal,
                    codigoModalidadeContratacao: modality,
                    uf: uf || undefined
                };
                if (!uf) delete params.uf;
                return axios.get(PNCP_BASE_URL, { params }).catch(err => ({ data: { data: [] } }));
            };

            // Flattened list of tasks
            const tasks = [];
            MODALITIES.forEach(mod => {
                for (let i = 1; i <= PAGES_TO_FETCH; i++) {
                    tasks.push({ page: i, mod });
                }
            });

            console.log(`Queueing ${tasks.length} requests to PNCP API...`);

            // Execute in batches
            const responses = [];
            for (let i = 0; i < tasks.length; i += CONCURRENT_LIMIT) {
                const batch = tasks.slice(i, i + CONCURRENT_LIMIT);
                const batchPromises = batch.map(t => fetchPage(t.page, t.mod));
                const batchResults = await Promise.all(batchPromises);
                responses.push(...batchResults);
                // Optional small delay
                // await new Promise(r => setTimeout(r, 100));
            }

            // Combine all data
            let allItems = [];
            responses.forEach(r => {
                if (r.data.data) allItems = allItems.concat(r.data.data);
            });

            // Format
            let formattedResults = allItems.map(item => {
                const cnpj = item.orgaoEntidade?.cnpj;
                const ano = item.anoCompra || item.anoContratacao;
                const sequencial = item.sequencialCompra || item.sequencialContratacao;

                return {
                    id: item.id,
                    objeto: item.objetoCompra || item.objetoContratacao || 'Sem objeto definido',
                    orgao: item.orgaoEntidade?.razaoSocial || 'Órgão não informado',
                    uf: item.unidadeOrcamentaria?.ufSigla || 'N/A',
                    municipio: item.unidadeOrcamentaria?.municipioNome || 'N/A',
                    modalidade: item.modalidadeContratacaoNome || 'N/A',
                    dataPublicacao: item.dataPublicacaoPncp,
                    link: `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${sequencial}`,
                    fonte: 'PNCP',
                    source: 'pncp',
                    linkLabel: 'Ver no PNCP'
                };
            });

            // Filter by Niche (q) if provided
            if (q) {
                const lowerQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // Remove accents for better search
                formattedResults = formattedResults.filter(item => {
                    const normalizedObj = (item.objeto || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                    return normalizedObj.includes(lowerQ);
                });
            }

            return {
                total: formattedResults.length, // Return ACTUAL found count
                pages: 1, // We flattened the pagination
                data: formattedResults
            };

        } catch (error) {
            if (error.response) {
                console.error('Error fetching from PNCP:', error.message);
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
                console.error('Response status:', error.response.status);
            } else {
                console.error('Error fetching from PNCP:', error.message);
            }
            // Return empty or throw
            throw error;
        }
    }
};

module.exports = pncpService;
