const express = require('express');
const router = express.Router();
const pncpService = require('../services/pncpService');

// GET /api/search
router.get('/search', async (req, res) => {
    try {
        const { q, uf, page, dateStart, dateEnd } = req.query;

        // Basic validation
        if (!q && !uf) {
            // Optional: require at least one filter
        }

        const data = await pncpService.searchTenders({ q, uf, page, dateStart, dateEnd });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do PNCP' });
    }
});

module.exports = router;
