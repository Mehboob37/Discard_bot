const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const unverifiedRoleName = "Unverified";
            const verifiedRoleName = "Verified";

            // Fetch roles or create them if they don't exist
            let unverifiedRole = member.guild.roles.cache.find(role => role.name === unverifiedRoleName);
            let verifiedRole = member.guild.roles.cache.find(role => role.name === verifiedRoleName);

            if (!unverifiedRole) {
                unverifiedRole = await member.guild.roles.create({
                    name: unverifiedRoleName,
                    color: '#FF0000',
                    permissions: [], // No permissions for unverified users
                });
            }

            if (!verifiedRole) {
                verifiedRole = await member.guild.roles.create({
                    name: verifiedRoleName,
                    color: '#00FF00',
                    permissions: [
                        PermissionsBitField.Flags.ViewChannel, // Allows viewing channels
                        PermissionsBitField.Flags.SendMessages, // Allows sending messages
                    ],
                });
            }

            // Assign the "Unverified" role and restrict channel access
            await member.roles.add(unverifiedRole);

            // Create a welcome message with CAPTCHA verification
            const welcomeMessage = `🎉 Welcome **${member.user.username}**! 🌟 We're glad to have you here.
            
👉 Explore the **#rules** channel to understand our community guidelines.
👉 Please verify yourself to access the server by completing the CAPTCHA below.`;

            const captchaEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('👋 Welcome to Our Community!')
                .setDescription(welcomeMessage)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Complete verification to unlock full access.', iconURL: member.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            const verifyButton = new ButtonBuilder()
                .setCustomId('verify_captcha')
                .setLabel('✅ Verify')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(verifyButton);

            // Find a suitable channel to send the message
            const defaultChannel = member.guild.systemChannel || member.guild.channels.cache.find(
                (channel) =>
                    channel.type === 0 && // Ensure it's a text channel
                    channel.permissionsFor(member.guild.members.me).has(PermissionsBitField.Flags.SendMessages)
            );

            if (!defaultChannel) {
                console.error('No suitable channel found for sending the welcome message.');
                return;
            }

            // Send the welcome message with the CAPTCHA button
            const message = await defaultChannel.send({ content: `Welcome <@${member.user.id}>!`, embeds: [captchaEmbed], components: [row] });

            // Handle button interaction
            const collector = message.channel.createMessageComponentCollector({
                filter: (interaction) => interaction.customId === 'verify_captcha' && interaction.user.id === member.user.id,
                time: 600000, // 10 minutes
            });

            collector.on('collect', async (interaction) => {
                try {
                    // Verify the user
                    await member.roles.remove(unverifiedRole);
                    await member.roles.add(verifiedRole);

                    await interaction.reply({
                        content: `✅ **${member.user.username}**, you have been verified! You now have full access to the server. 🎉`,
                        ephemeral: true,
                    });
                } catch (error) {
                    console.error('Error verifying member:', error.message);
                    await interaction.reply({
                        content: `❌ An error occurred during verification. Please contact an admin.`,
                        ephemeral: true,
                    });
                }
            });

            collector.on('end', (collected) => {
                if (!collected.size) {
                    member.roles.remove(unverifiedRole).catch(console.error);
                    defaultChannel.send(
                        `⏳ **${member.user.username}**, your verification time has expired. Please rejoin the server to try again.`
                    );
                }
            });
        } catch (error) {
            console.error('Error welcoming new member:', error.message);
        }
    },
};
