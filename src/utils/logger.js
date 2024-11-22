// src/utils/logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// Define log format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

// Initialize logger
const logger = createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, '../../logs/combined.log') }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join(__dirname, '../../logs/exceptions.log') })
    ]
});

module.exports = logger;
