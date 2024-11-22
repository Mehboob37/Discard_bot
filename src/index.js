// src/index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const logger = require('./utils/logger'); // Assuming you have a logger utility

// Initialize Discord Client
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});

// Load Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`Loaded command: ${command.data.name}`);
        } else {
            logger.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    } catch (error) {
        logger.error(`[ERROR] Failed to load command at ${filePath}: ${error}`);
    }
}

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Handle Uncaught Exceptions and Rejections
process.on('unhandledRejection', error => {
    logger.error(`Unhandled promise rejection: ${error}`);
    // Optionally, notify admins or take other actions
});

process.on('uncaughtException', error => {
    logger.error(`Uncaught exception: ${error}`);
    // Optionally, perform cleanup and exit
});
client.on('messageCreate', async (message) => {
    console.log(`Message received from ${message.author.tag}: ${message.content}`);
    // Further processing
});

// Initialize Express Server
const expressApp = require('./server/app.js');

// Login to Discord
client.login("MTMwODYxMzUwNzgzODc3NTM0Nw.GJ7siF.Cyg6QnazCd3pNkrLJeGiuV-YEl6_MGqmTPOzM0")
    .then(() => logger.info('Discord Bot is online!'))
    .catch(error => logger.error(`Failed to login Discord Bot: ${error}`));
