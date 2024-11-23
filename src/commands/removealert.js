// src/commands/removealert.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removealert')
        .setDescription('Remove an existing alert')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token ticker symbol, e.g., SOL')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Alert type: price or volume')
                .setRequired(true)
                .addChoices(
                    { name: 'Price', value: 'price' },
                    { name: 'Volume', value: 'volume' }
                ))
        .addNumberOption(option =>
            option.setName('threshold')
                .setDescription('Threshold value for the alert')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const token = interaction.options.getString('token').toLowerCase();
        const type = interaction.options.getString('type');
        const threshold = interaction.options.getNumber('threshold');

        const alertsPath = path.join(__dirname, '../../data/alerts.json');
        let alerts = JSON.parse(fs.readFileSync(alertsPath));

        if (!alerts[userId]) {
            return interaction.reply({ content: 'You have no active alerts.', ephemeral: true });
        }

        const alertIndex = alerts[userId].findIndex(alert => alert.token === token && alert.type === type && alert.threshold === threshold);

        if (alertIndex === -1) {
            return interaction.reply({ content: 'Alert not found.', ephemeral: true });
        }

        alerts[userId].splice(alertIndex, 1);

        // If user has no more alerts, remove their key
        if (alerts[userId].length === 0) {
            delete alerts[userId];
        }

        fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));

        await interaction.reply({ content: `Alert for **${token.toUpperCase()}** when ${type} crosses **${threshold}** has been removed.`, ephemeral: true });
    },
};
