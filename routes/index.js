const express = require('express');
const scheduleRoutes = require('./scheduleRoutes');

const router = express.Router();

router.use('/schedules', scheduleRoutes);

module.exports = router;
