// src/commands/price.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pricecheck')
        .setDescription('Fetch Solana (SOL) price and 24-hour volume information'),
    async execute(interaction) {
        const token = "solana"; // CoinGecko uses "solana" as the ID for SOL token

        try {
            // Fetch data from CoinGecko API
            const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${token}`);
            const data = response.data;

            if (!data || !data.market_data) {
                return interaction.reply({ content: 'Price data not available for SOL.', ephemeral: true });
            }

            // Extract price and 24h volume
            const price = data.market_data.current_price.usd.toFixed(2);
            const volume = data.market_data.total_volume.usd.toLocaleString();

            // Reply with the fetched data
            await interaction.reply(`**SOL Price:** $${price}\n**24h Volume:** $${volume}`);
        } catch (error) {
            console.error('Error fetching data:', error);
            await interaction.reply({ content: 'Failed to fetch price data for SOL.', ephemeral: true });
        }
    },
};
