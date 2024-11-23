const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const Parser = require('rss-parser');
const cron = require('node-cron');
const logger = require('./utils/logger'); // Assuming you have a logger utility
const parser = new Parser();
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
// Fetch news function
const CHANNEL_ID = '1309373303110107190';
async function fetchSolanaNews() {
    try {
        const feed = await parser.parseURL('https://decrypt.co/feed'); // Decrypt RSS feed
        const solanaNews = feed.items.filter(item => item.title.toLowerCase().includes('solana'));

        if (solanaNews.length === 0) {
            return 'No recent Solana news found.';
        }

        const newsMessages = solanaNews.slice(0, 5).map(item => `**${item.title}**\n${item.link}`).join('\n\n');
        return newsMessages;
    } catch (error) {
        console.error(error);
        return 'Failed to fetch news.';
    }
}

// Send news to a specific channel function
async function sendNewsToChannel() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
        console.log('Channel not found!');
        return;
    }

    const newsMessages = await fetchSolanaNews();
    channel.send(newsMessages);
}

// Schedule the task with cron (every 1 hour in this case)
cron.schedule('* * * * *', () => { // Cron job runs every hour
    sendNewsToChannel();
});

client.once('ready', () => {
    console.log('Bot is ready and cron job is running!');
});


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

// Initialize Express Server
const expressApp = require('./server/app.js');

// Login to Discord
client.login('MTMwODc4Njk1MDY4MTAwNjE5MQ.GHVO6r.LwGoRQfVjUD_vK_kGnCi5zxUdcmRBnXKgFYQT4')
    .then(() => logger.info('Discord Bot is online!'))