const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sentiment')
        .setDescription('Get social sentiment for Solana tokens')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token ticker symbol, e.g., SOL')
                .setRequired(true)),
    async execute(interaction) {
        const token = interaction.options.getString('token').toUpperCase();

        try {
            // Example API call to Lunar Crush
            const response = await axios.get(`https://api.lunarcrush.com/v2?data=assets&key=${process.env.LUNARCRUSH_API_KEY}&symbol=${token}`);
            const data = response.data.data[0];

            if (!data) {
                return interaction.reply({ content: 'Sentiment data not available for this token.', ephemeral: true });
            }

            const sentiment = data.sentiment?.sentiment || 'Neutral';
            const volume = data.volume?.volume || 'N/A';

            await interaction.reply(`**${token} Sentiment:** ${sentiment}\n**Social Volume:** ${volume}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch sentiment data.', ephemeral: true });
        }
    },
};
