const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('captcha')
        .setDescription('Captcha verification commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set up captcha verification')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for verification')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('verified_role')
                        .setDescription('Role to assign upon verification')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const channel = interaction.options.getChannel('channel');
            const verifiedRole = interaction.options.getRole('verified_role');

            // Save the verification settings to config or database
            const config = require('../../config/config.json');
            config.verificationChannel = channel.id;
            config.verifiedRole = verifiedRole.id;
            const fs = require('fs');
            fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

            await interaction.reply({ content: `Captcha verification set up in ${channel} with verified role ${verifiedRole}.`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
