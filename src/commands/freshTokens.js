const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newtoken')
        .setDescription('Get information about newly launched Solana tokens'),
    async execute(interaction) {
        try {
            // Example API call to fetch new tokens
            // Replace with actual API endpoint and parameters
            const response = await axios.get('https://api.solana.com/newtokens'); // Placeholder URL
            const tokens = response.data.tokens;

            if (!tokens || tokens.length === 0) {
                return interaction.reply({ content: 'No new tokens found.', ephemeral: true });
            }

            const tokenMessages = tokens.map(token =>
                `**Name:** ${token.name}\n**Contract Address:** ${token.contract}\n**Launch Time:** ${token.launchTime}\n**Risk Score:** ${token.riskScore}`
            ).join('\n\n');

            await interaction.reply({ content: tokenMessages, ephemeral: false });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch new tokens.', ephemeral: true });
        }
    },
};
