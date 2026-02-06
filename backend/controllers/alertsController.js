const alertService = require('../services/alertService');

exports.subscribe = async (req, res) => {
    try {
        const { email, q, uf, sources } = req.body || {};
        if (!email) {
            return res.status(400).json({ error: 'E-mail é obrigatório.' });
        }
        const result = await alertService.subscribe({ email, q, uf, sources });
        res.json({ ok: true, subscription: result });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar alerta.' });
    }
};

exports.run = async (req, res) => {
    try {
        const token = req.header('x-alert-token') || '';
        const expected = process.env.ALERTS_RUN_TOKEN || '';
        if (expected && token !== expected) {
            return res.status(403).json({ error: 'Token inválido.' });
        }
        const result = await alertService.runAlerts();
        res.json({ ok: true, result });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao executar alertas.' });
    }
};
