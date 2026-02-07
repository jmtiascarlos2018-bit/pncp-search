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
    const portalTransparenciaService = require('./services/portalTransparenciaService');
    const comprasGovService = require('./services/comprasGovService');

    const ptKeyPresent = !!process.env.PORTAL_TRANSPARENCIA_API_KEY;

    // Test fetch to Compras.gov (simple query)
    let comprasGovStatus = 'unknown';
    let comprasGovData = null;
    try {
        const result = await comprasGovService.searchTenders({ q: 'caneta', page: 1 }); // Simple term
        comprasGovStatus = result.data.length > 0 ? 'working' : 'empty_response';
        comprasGovData = result.data.slice(0, 2);
    } catch (e) {
        comprasGovStatus = `error: ${e.message}`;
    }

    // Test fetch to Portal Transparencia (if key present)
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
            status: ptStatus
        },
        compras_gov: {
            api_key_required: false,
            status: comprasGovStatus,
            sample_data: comprasGovData
        }
    });
});

// System Status Endpoint (for debugging integrations)
app.get('/api/status', (req, res) => {
    res.json({
        ai: !!process.env.GEMINI_API_KEY,
        sources: {
            pncp: true,
            portal_transparencia: !!process.env.PORTAL_TRANSPARENCIA_API_KEY,
            compras_gov: true
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
