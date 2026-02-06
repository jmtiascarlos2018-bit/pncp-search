const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.post('/subscribe', alertsController.subscribe);
router.post('/run', alertsController.run);

module.exports = router;
