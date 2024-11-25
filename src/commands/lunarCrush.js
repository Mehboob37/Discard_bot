const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sentiment')
        .setDescription('Get market and social data for a cryptocurrency')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token ticker symbol, e.g., SOL')
                .setRequired(true)),
    async execute(interaction) {
        const token = interaction.options.getString('token').toLowerCase(); // CoinGecko uses lowercase

        try {
            // Fetch coin data from CoinGecko
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);

            const data = response.data;

            if (!data) {
                return interaction.reply({ content: 'Data not available for this token.', ephemeral: true });
            }

            // Extract relevant data
            const marketData = data.market_data || {};
            const communityData = data.community_data || {};

            const sentimentVotesUp = communityData.sentiment_votes_up_percentage || 'N/A';
            const sentimentVotesDown = communityData.sentiment_votes_down_percentage || 'N/A';
            const socialVolume = communityData.twitter_followers || 'N/A';

            // Reply with the data
            await interaction.reply(
                `**${data.name} (${data.symbol.toUpperCase()})**\n` +
                `- Sentiment Upvotes: ${sentimentVotesUp}%\n` +
                `- Sentiment Downvotes: ${sentimentVotesDown}%\n` +
                `- Twitter Followers: ${socialVolume}`
            );
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch data. Please check the token symbol or try again later.', ephemeral: true });
        }
    },
};
