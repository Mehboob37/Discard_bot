// src/commands/listalerts.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listalerts')
        .setDescription('List all your active alerts'),
    async execute(interaction) {
        const userId = interaction.user.id;

        const alertsPath = path.join(__dirname, '../../data/alerts.json');
        let alerts = JSON.parse(fs.readFileSync(alertsPath));

        if (!alerts[userId] || alerts[userId].length === 0) {
            return interaction.reply({ content: 'You have no active alerts.', ephemeral: true });
        }

        let message = '**Your Active Alerts:**\n';
        alerts[userId].forEach((alert, index) => {
            message += `${index + 1}. **${alert.token.toUpperCase()}** when ${alert.type} crosses **${alert.threshold}**\n`;
        });

        await interaction.reply({ content: message, ephemeral: true });
    },
};
