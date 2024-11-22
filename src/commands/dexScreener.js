const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('price')
        .setDescription('Fetch token price information')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token ticker symbol, e.g., SOL')
                .setRequired(true)),
    async execute(interaction) {
        const token = interaction.options.getString('token').toUpperCase();

        try {
            // Example API call to Dex Screener or similar service
            // Replace with actual API endpoint and parameters
            const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${token}`);
            const data = response.data;

            if (!data || !data.priceUsd || !data.volume24h) {
                return interaction.reply({ content: 'Price data not available for this token.', ephemeral: true });
            }

            const price = data.priceUsd;
            const volume = data.volume24h;

            await interaction.reply(`**${token} Price:** $${price}\n**24h Volume:** $${volume}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch price data.', ephemeral: true });
        }
    },
};
