// src/commands/newtokens.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getNewTokens } = require('../utils/tokenTracker');
const { getRiskScore } = require('../utils/riskAssessment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newtokens')
        .setDescription('Display newly launched Solana tokens with details and risk assessments'),
    async execute(interaction) {
        await interaction.deferReply(); // Defer the reply as fetching may take time
        
        const newTokens = await getNewTokens();

        if (newTokens.length === 0) {
            return interaction.editReply('No new Solana tokens detected at this time.');
        }

        let message = '**New Solana Token Launches:**\n\n';

        for (const token of newTokens) {
            // Fetch risk assessment
            const riskScore = await getRiskScore(token.id);

            // Fetch detailed token data (optional)
            // You can enhance this by fetching additional details like launch time if available

            message += `**Name:** ${token.name}\n**Symbol:** ${token.symbol.toUpperCase()}\n**Contract Address:** [View on Solscan](https://solscan.io/token/${token.id})\n**Risk Assessment:** ${riskScore}\n\n`;
        }

        await interaction.editReply(message);
    },
};
