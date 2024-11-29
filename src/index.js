// src/index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const logger = require('./utils/logger'); 
const cron = require('node-cron');
const axios = require('axios');
const { sendLeaderboardToChannel } = require('./scheduledTasks/rankingScheduale.js');

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
const newTokenNotifier = require('./scheduledTasks/newTokenNotifier');

let targetChannelId = '1310487710716264488'
client.on('messageCreate', async (message) => {
    console.log(`Message received from ${message.author.tag}: ${message.content}`);
    
   
    // newTokenNotifier(client);
});

const tokenMapping = {
    SOLUSD: 'solana',
    BTCUSD: 'bitcoin',
    ETHUSD: 'ethereum',
    // Add more tokens as needed
};

const alertThresholds = {
    SOLUSD: 257.43, // Alert if SOL price exceeds $25
    BTCUSD: 30000, // Alert if BTC price exceeds $30,000
    ETHUSD: 1800, // Alert if ETH price exceeds $1,800
};

// const targetChannelId = '1309349932247023717'; // Replace with your Discord channel ID

function startAutoPriceMonitoring(client) {
    cron.schedule('* * * * *', async () => { // Runs every minute
        console.log('Checking token prices...');
        for (const [ticker, tokenId] of Object.entries(tokenMapping)) {
            try {
                // Fetch token price from CoinGecko API
                const priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`;
                const priceResponse = await fetch(priceApiUrl);

                if (!priceResponse.ok) {
                    throw new Error(`Failed to fetch price data for ${ticker} with status: ${priceResponse.status}`);
                }

                const priceData = await priceResponse.json();
                const tokenPrice = priceData[tokenId]?.usd;

                if (!tokenPrice) {
                    console.error(`Price data not available for ${ticker}`);
                    continue;
                }

                console.log(`[${ticker}] Current Price: $${tokenPrice}`);

                // Check if the token price exceeds the threshold
                if (tokenPrice >= alertThresholds[ticker]) {
                    console.log(`[ALERT] ${ticker} price has crossed the threshold! Current price: $${tokenPrice}`);
                    
                    // Send alert to specific Discord channel
                    const channel = await client.channels.fetch(targetChannelId);
                    if (channel) {
                        await channel.send(`[ALERT] ${ticker} price has crossed your threshold! Current price: $${tokenPrice}`);
                    } else {
                        console.error('Channel not found.');
                    }
                }
            } catch (error) {
                console.error(`Error fetching price for ${ticker}:`, error.message);
            }
        }
    });
}
// client.once('ready', () => {
//     console.log('Bot is logged in and ready!');
//     startAutoPriceMonitoring(client); // Start the cron job
// });

// Initialize Express Server
const expressApp = require('./server/app.js');
const fetchAndPostNews = require('./scheduledTasks/scheduleNewsUpdates.js');
 
client.login("MTMwODYxMzUwNzgzODc3NTM0Nw.GJ7siF.Cyg6QnazCd3pNkrLJeGiuV-YEl6_MGqmTPOzM0")
    .then(() => logger.info('Discord Bot is online!'))
    .catch(error => logger.error(`Failed to login Discord Bot: ${error}`));
