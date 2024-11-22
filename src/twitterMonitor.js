const { TwitterApi, ETwitterStreamEvent } = require('twitter-api-v2');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log('Twitter Monitor Bot is online!');
    monitorTweets();
});

async function monitorTweets() {
    try {
        const stream = await twitterClient.v2.searchStream({
            'tweet.fields': ['author_id'],
            expansions: ['author_id'],
            'user.fields': ['username'],
        });

        stream.autoReconnect = true;

        stream.on(ETwitterStreamEvent.Data, async tweet => {
            const solanaKeywords = ['solana defi', 'solana nft', 'solana partnerships'];
            if (solanaKeywords.some(keyword => tweet.data.text.toLowerCase().includes(keyword))) {
                const guild = client.guilds.cache.get(process.env.GUILD_ID);
                if (!guild) return;

                const channel = guild.channels.cache.find(ch => ch.name === 'solana-tweets');
                if (channel) {
                    const userId = tweet.data.author_id;
                    const user = await twitterClient.v2.user(userId);
                    channel.send(`**New Tweet from ${user.data.username}:**\n${tweet.data.text}\nhttps://twitter.com/${user.data.username}/status/${tweet.data.id}`);
                }
            }
        });

        stream.on(ETwitterStreamEvent.Error, error => {
            console.error('Twitter Stream Error:', error);
        });
    } catch (error) {
        console.error('Failed to set up Twitter stream:', error);
    }
}

client.login(process.env.DISCORD_TOKEN);
