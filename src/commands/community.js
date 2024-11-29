const { SlashCommandBuilder } = require('discord.js');

const guildMemberAdd = require('../events/guildMemberAdd');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('community')
        .setDescription('Community engagement commands')
        .addUserOption(option =>
            option
                .setName('member')
                .setDescription('The member to simulate joining.')
                .setRequired(true)
        ),
        async execute(interaction) {
            const member = interaction.options.getMember('member');
    
            if (!member) {
                return interaction.reply({ content: 'Member not found.', ephemeral: true });
            }
    
            // Simulate the GuildMemberAdd event
            try {
                await guildMemberAdd.execute(member);
                interaction.reply({ content: `Simulated new member join for ${member.user.tag}.`, ephemeral: true });
            } catch (error) {
                console.error('Error simulating member join:', error);
                interaction.reply({ content: 'An error occurred while simulating the event.', ephemeral: true });
            }
        },
};
