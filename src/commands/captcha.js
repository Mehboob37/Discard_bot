const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCaptcha } = require('../utils/captcha'); // Import the CAPTCHA utility

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
                        .setRequired(true))  // Channel where CAPTCHA will be sent
                .addRoleOption(option =>
                    option.setName('verified_role')
                        .setDescription('Role to assign upon verification')
                        .setRequired(true))  // Role to assign to users after successful CAPTCHA
        ),
    async execute(interaction) {
        try {
            // Acknowledge the interaction immediately
            await interaction.deferReply();
            console.log('Received /captcha setup command');

            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'setup') {
                const channel = interaction.options.getChannel('channel');
                const verifiedRole = interaction.options.getRole('verified_role');
                console.log('Setting up verification in channel:', channel.name, 'with verified role:', verifiedRole.name);

                // Provide an immediate response to avoid the "thinking" state
                await interaction.editReply({
                    content: 'Setting up captcha verification, please wait...',
                    ephemeral: true
                });

                // Save the verification settings to config or database
                const configPath = path.join(__dirname, '../../config/config.json');
                console.log('Loading config from:', configPath);
                const config = JSON.parse(fs.readFileSync(configPath));

                config.verificationChannel = channel.id;
                config.verifiedRole = verifiedRole.id;
                console.log('Updated config:', config);

                // Save the updated config back
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                console.log('Config saved successfully.');

                // Send final confirmation
                await interaction.editReply({
                    content: `Captcha verification set up in ${channel} with verified role ${verifiedRole}.`,
                    ephemeral: true
                });
            } else {
                await interaction.editReply({ content: 'Unknown subcommand.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error handling captcha setup:', error);
            await interaction.editReply({
                content: 'There was an error while setting up the captcha. Please try again later.',
                ephemeral: true
            });
        }
    },
};
