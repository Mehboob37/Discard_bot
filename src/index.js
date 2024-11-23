const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const logger = require('./utils/logger'); // Assuming you have a logger utility
const { CronJob } = require('cron');
// Initialize Discord Client
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});

// List of prohibited words and phishing domains
const prohibitedWords = ["hakim","kabeera"];
const phishingDomains = []; 

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

// Auto-Moderation Logic
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check for prohibited words
    const foundWord = prohibitedWords.find(word => message.content.toLowerCase().includes(word.toLowerCase()));
    if (foundWord) {
        try {
            await message.delete();
            await message.channel.send(`⚠️ ${message.author}, your message contained a prohibited word and was deleted.`);
            logger.info(`Deleted message containing prohibited word: ${foundWord}`);
        } catch (error) {
            logger.error(`Failed to delete message: ${error}`);
        }
    }

    // Check for phishing links/domains
    if (phishingDomains.some(domain => message.content.toLowerCase().includes(domain))) {
        try {
            await message.delete();
            const warningMessage = `Your message contained a phishing link and was removed.`;
            await message.channel.send({ content: warningMessage, ephemeral: true });

            // Log the action
            const modLogsChannelObj = message.guild.channels.cache.find(channel => channel.name === 'mod-logs'); // Change to your mod logs channel name
            if (modLogsChannelObj) {
                modLogsChannelObj.send(`Message from ${message.author.tag} was deleted for containing a phishing link.`);
            }
        } catch (error) {
            logger.error(`Failed to delete phishing message: ${error}`);
        }
    }
});

// Handle Uncaught Exceptions and Rejections
process.on('unhandledRejection', error => {
    logger.error(`Unhandled promise rejection: ${error}`);
});

process.on('uncaughtException', error => {
    logger.error(`Uncaught exception: ${error}`);
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

const targetChannelId = '1309475707910488145'; // Replace with your Discord channel ID

// Function to start auto price monitoring
function startAutoPriceMonitoring() {
    const job = new CronJob('* * * * *', async () => {
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
                        channel.send(`[ALERT] ${ticker} price has crossed your threshold! Current price: $${tokenPrice}`);
                    } else {
                        console.error('Channel not found.');
                    }
                }
            } catch (error) {
                console.error(`Error fetching price for ${ticker}:`, error.message);
            }
        }
    });

    job.start();
}
client.once('ready', () => {
    console.log('Bot is logged in and ready!');
    startAutoPriceMonitoring();
});
// Initialize Express Server
const expressApp = require('./server/app.js');

// Login to Discord
client.login('MTMwODc4Njk1MDY4MTAwNjE5MQ.GHVO6r.LwGoRQfVjUD_vK_kGnCi5zxUdcmRBnXKgFYQT4')
    .then(() => logger.info('Discord Bot is online!'))