const { SlashCommandBuilder } = require('discord.js');
const { Events } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('Moderation commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setrules')
                .setDescription('Set the server rules')
                .addStringOption(option =>
                    option.setName('rules')
                        .setDescription('Server rules')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('addmod')
                .setDescription('Add a moderator role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Moderator role')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setrules') {
            const rules = interaction.options.getString('rules');

            // Save the rules to config or database
            const config = require('../../config/config.json');
            config.serverRules = rules;
            const fs = require('fs');
            fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

            await interaction.reply({ content: 'Server rules updated successfully!', ephemeral: true });
        } else if (subcommand === 'addmod') {
            const role = interaction.options.getRole('role');

            // Save the moderator role to config or database
            const config = require('../../config/config.json');
            config.moderatorRole = role.id;
            const fs = require('fs');
            fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

            await interaction.reply({ content: `Moderator role set to ${role.name}!`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
