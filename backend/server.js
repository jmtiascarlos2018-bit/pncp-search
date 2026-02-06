require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pncpRoutes = require('./routes/pncpRoutes');
const alertsRoutes = require('./routes/alertsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', pncpRoutes);
app.use('/api/alerts', alertsRoutes);
const brainController = require('./controllers/brainController');
app.post('/api/analyze', brainController.analyze);

// Serve frontend (Vite build) from the same host
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'PNCP Search API is running' });
});

// SPA fallback (serve index.html for non-API routes)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
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
