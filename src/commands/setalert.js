// src/commands/setalert.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setalert')
        .setDescription('Set a custom price or volume alert for a Solana token')
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
            alerts[userId] = [];
        }

        // Check for duplicate alerts
        const duplicate = alerts[userId].find(alert => alert.token === token && alert.type === type && alert.threshold === threshold);
        if (duplicate) {
            return interaction.reply({ content: 'This alert already exists.', ephemeral: true });
        }

        // Add new alert
        alerts[userId].push({ token, type, threshold });
        fs.writeFileSync(alertsPath, JSON.stringify(alerts, null, 2));

        await interaction.reply({ content: `Alert set for **${token.toUpperCase()}** when ${type} crosses **${threshold}**.`, ephemeral: true });
    },
};
