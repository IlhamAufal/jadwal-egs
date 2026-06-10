const express = require('express');
const scheduleRoutes = require('./scheduleRoutes');

const router = express.Router();

router.use('/schedule', scheduleRoutes);

module.exports = router;
