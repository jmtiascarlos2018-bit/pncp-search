const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

// GET /api/search
router.get('/search', async (req, res) => {
    try {
        const { q, uf, page, dateStart, dateEnd, sources } = req.query;

        // Basic validation
        if (!q && !uf) {
            // Optional: require at least one filter
        }

        const data = await searchService.searchTenders({ q, uf, page, dateStart, dateEnd, sources });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados das fontes' });
    }
});

module.exports = router;
