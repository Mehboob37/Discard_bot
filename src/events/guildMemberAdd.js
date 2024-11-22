const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const configPath = path.join(__dirname, '../../config/config.json');
        const config = JSON.parse(fs.readFileSync(configPath));

        const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannel) || member.guild.channels.cache.find(channel => channel.name === 'welcome');

        if (!welcomeChannel) return;

        const welcomeMessage = config.welcomeMessage || `Welcome ${member.user.username}! Explore the #rules channel and claim your roles in #get-roles.`;
        await welcomeChannel.send({ content: welcomeMessage });

        // Assign Unverified role if captcha is set up
        if (config.verificationChannel && config.verifiedRole) {
            const unverifiedRole = member.guild.roles.cache.find(role => role.name === 'Unverified');
            if (unverifiedRole) {
                await member.roles.add(unverifiedRole);
            }

            const verificationChannel = member.guild.channels.cache.get(config.verificationChannel);
            if (verificationChannel) {
                verificationChannel.send(`<@${member.id}>, please complete the CAPTCHA to verify yourself.`);
            }
        }
    },
};
