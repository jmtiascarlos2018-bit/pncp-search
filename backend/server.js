require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pncpRoutes = require('./routes/pncpRoutes');
const alertsRoutes = require('./routes/alertsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Middleware
app.use(cors({
    origin: '*', // Allow all origins to rule out CORS specific issues
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', pncpRoutes);
app.use('/api/alerts', alertsRoutes);
const brainController = require('./controllers/brainController');
app.post('/api/analyze', brainController.analyze);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'PNCP Search API is running' });
});

// Debug endpoint to check configured AI Model
app.get('/api/debug/ai', async (req, res) => {
    // Import dynamically to ensure we get the latest
    const { listAvailableModels } = require('./services/geminiService');
    const modelCheck = await listAvailableModels();

    res.json({
        config: {
            configured_model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
            api_key_present: !!process.env.GEMINI_API_KEY,
            api_key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'N/A'
        },
        connectivity_check: modelCheck
    });
});

// Debug endpoint for Search Sources
app.get('/api/debug/sources', async (req, res) => {
    const axios = require('axios');
    const portalTransparenciaService = require('./services/portalTransparenciaService');
    const comprasGovService = require('./services/comprasGovService');

    const ptKeyPresent = !!(process.env.PORTAL_TRANSPARENCIA_API_KEY || '2d56e224c48183a794e0c0642df64f62');

    // 1. Service Level Test (Application Logic)
    let serviceTest = {};
    try {
        const result = await comprasGovService.searchTenders({ q: 'caneta', page: 1 });
        serviceTest = {
            status: result.data.length > 0 ? 'working' : 'empty_response',
            count: result.data.length
        };
    } catch (e) {
        serviceTest = { status: 'error', message: e.message };
    }

    // 2. Direct API Level Test (Network/Firewall/API Logic)
    let directApiTest = {};
    try {
        // Reduced timeout to fail fast if blocked -> Increased to 30s to match service
        const testUrl = 'https://compras.dados.gov.br/licitacoes/v1/licitacoes.json?objeto=caneta&offset=0';
        const rawRes = await axios.get(testUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let count = 0;
        if (rawRes.data && rawRes.data._embedded && rawRes.data._embedded.licitacoes) {
            count = rawRes.data._embedded.licitacoes.length;
        }

        directApiTest = {
            success: true,
            status: rawRes.status,
            data_keys: Object.keys(rawRes.data || {}),
            item_count: count
        };
    } catch (err) {
        directApiTest = {
            success: false,
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText
        };
    }

    // Portal Transparencia Logic (unchanged)
    let ptStatus = 'skipped (no key)';
    if (ptKeyPresent) {
        try {
            const result = await portalTransparenciaService.searchTenders({ q: 'caneta', page: 1 });
            ptStatus = result.data.length > 0 ? 'working' : 'empty_response';
        } catch (e) {
            ptStatus = `error: ${e.message}`;
        }
    }

    res.json({
        portal_transparencia: {
            api_key_present: ptKeyPresent,
            status: ptStatus,
            instruction: !ptKeyPresent ? "Get key at https://portaldatransparencia.gov.br/api-de-dados/cadastrar" : "Key present"
        },
        compras_gov: {
            service_check: serviceTest,
            direct_api_check: directApiTest
        }
    });
});

// System Status Endpoint (for debugging integrations)
app.get('/api/status', (req, res) => {
    const ptKey = process.env.PORTAL_TRANSPARENCIA_API_KEY || '2d56e224c48183a794e0c0642df64f62';

    res.json({
        services: {
            pncp: 'ok',
            portal_transparencia: ptKey ? 'ok' : 'error',
            compras_gov: 'ok',
            gemini: process.env.GEMINI_API_KEY ? 'ok' : 'error'
        },
        env: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint for Render Health Check
app.get('/', (req, res) => {
    res.send('API is Online (Backend Only)');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
