// src/server/routes/index.js
const express = require('express');
const router = express.Router();

// Example Route
router.get('/status', (req, res) => {
    res.json({ status: 'Server is up and running!' });
});

module.exports = router;
