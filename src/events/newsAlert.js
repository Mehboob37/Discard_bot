const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
    name: 'messageCreate', // This corresponds to the event name 'messageCreate'
    once: false, // This should be false because we want the event to be triggered continuously
    execute: async (message, client) => {
        try {
            // Check if the message is in the #solana-news channel and does not come from a bot
            if (message.channel.name === 'solana-news' && !message.author.bot) {
                const feed = await parser.parseURL('https://decrypt.co/feed'); // Decrypt RSS feed

                // Filter news related to Solana
                const solanaNews = feed.items.filter(item => item.title.toLowerCase().includes('solana'));

                // If no Solana news is found, don't send a message
                if (solanaNews.length === 0) {
                    return;
                }

                // Prepare the news message
                const newsMessages = solanaNews.slice(0, 5).map(item => `**${item.title}**\n${item.link}`).join('\n\n');

                // Send the news to the channel
                message.channel.send({ content: newsMessages });
            }
        } catch (error) {
            console.error(error);
        }
    }
};
