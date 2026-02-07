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
app.get('/api/debug/ai', (req, res) => {
    res.json({
        configured_model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-001',
        api_key_present: !!process.env.GEMINI_API_KEY
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
