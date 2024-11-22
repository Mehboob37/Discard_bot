// src/server/app.js
const express = require('express');
const path = require('path');
const logger = require('../utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (if any)
app.use(express.static(path.join(__dirname, '../../public')));

// Routes
app.get('/', (req, res) => {
    res.send('Discord Bot is running!');
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

// Error Handler
app.use((err, req, res, next) => {
    logger.error(`Server Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
    logger.info(`Express server is running on port ${PORT}`);
});

module.exports = app;
