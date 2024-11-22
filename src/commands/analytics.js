const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chart')
        .setDescription('Generate TradingView price chart')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Ticker symbol, e.g., SOLUSD')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('timeframe')
                .setDescription('Timeframe, e.g., 1h')
                .setRequired(true)),
    async execute(interaction) {
        const ticker = interaction.options.getString('ticker').toUpperCase();
        const timeframe = interaction.options.getString('timeframe');

        try {
            // Placeholder for TradingView API integration
            // Replace with actual API endpoint and parameters
            const apiUrl = `https://api.tradingview.com/symbols/${ticker}/chart?timeframe=${timeframe}&apikey=${process.env.TRADINGVIEW_API_KEY}`;
            const response = await axios.get(apiUrl);

            // Assuming the API returns an image URL
            const chartUrl = response.data.chartImageUrl;

            if (!chartUrl) {
                return interaction.reply({ content: 'Chart not available.', ephemeral: true });
            }

            await interaction.reply({ content: `Here is your chart for ${ticker} (${timeframe}): ${chartUrl}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch chart data.', ephemeral: true });
        }
    },
};
