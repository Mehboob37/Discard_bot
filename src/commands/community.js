const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('community')
        .setDescription('Community engagement commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setwelcome')
                .setDescription('Set a custom welcome message')
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Welcome message with [username]')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setwelcome') {
            const message = interaction.options.getString('message');

            // Save the welcome message to config or database
            // For simplicity, using config.json

            const config = require('../../config/config.json');
            config.welcomeMessage = message;
            const fs = require('fs');
            fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

            await interaction.reply({ content: 'Welcome message updated successfully!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
