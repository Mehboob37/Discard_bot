const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whalealert')
        .setDescription('Manage whale alerts')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up whale alert monitoring')
                .addNumberOption(option =>
                    option.setName('threshold')
                        .setDescription('SOL amount threshold for alerts (e.g., 10000)')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel to post alerts')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const threshold = interaction.options.getNumber('threshold');
            const channel = interaction.options.getChannel('channel');

            // Save the whale alert settings to config or database
            const config = require('../../config/config.json');
            config.whaleAlert = {
                threshold: threshold,
                channelId: channel.id,
            };
            const fs = require('fs');
            fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

            await interaction.reply({ content: `Whale alerts set for transactions over ${threshold} SOL in ${channel}.`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
