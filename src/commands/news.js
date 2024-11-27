const { SlashCommandBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Fetch the latest Solana crypto news'),
    async execute(interaction) {
        try {
            const feed = await parser.parseURL('https://decrypt.co/feed'); // Example RSS feed

            const solanaNews = feed.items.filter(item => item.title.toLowerCase().includes('solana'));

            if (solanaNews.length === 0) {
                return interaction.reply('No recent Solana news found.');
            }

            const newsMessages = solanaNews.slice(0, 5).map(item => `**${item.title}**\n${item.link}`).join('\n\n');

            await interaction.reply({ content: newsMessages, ephemeral: false });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch news.', ephemeral: true });
        }
    },
};