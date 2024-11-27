const fs = require('fs');
const path = require('path');
const { createCaptcha } = require('../utils/captcha'); // Import the CAPTCHA function

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const configPath = path.join(__dirname, '../../config/config.json');
        const config = JSON.parse(fs.readFileSync(configPath));

        // Ensure that verification is configured
        if (config.verificationChannel && config.verifiedRole) {
            const unverifiedRole = member.guild.roles.cache.find(role => role.name === 'Unverified');
            if (unverifiedRole) {
                await member.roles.add(unverifiedRole);
            }

            const verificationChannel = member.guild.channels.cache.get(config.verificationChannel);
            if (verificationChannel) {
                // Send CAPTCHA challenge
                const captchaChallenge = await createCaptcha();  // Ensure this function works
                const captchaMessage = await verificationChannel.send({
                    content: `<@${member.id}>, please complete the CAPTCHA to verify yourself.`,
                    files: [captchaChallenge.file]
                });

                const filter = response => response.author.id === member.id && response.content.toLowerCase() === captchaChallenge.answer.toLowerCase();
                const collector = captchaMessage.createMessageCollector({ filter, time: 60000 });

                collector.on('collect', async () => {
                    const verifiedRole = member.guild.roles.cache.get(config.verifiedRole);
                    await member.roles.remove(unverifiedRole);  // Remove Unverified role
                    await member.roles.add(verifiedRole); // Add Verified role
                    await member.send('You have successfully verified as human and have been granted the Verified role!');
                    collector.stop();
                });

                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        await member.send('You failed to verify in time. Please try again.');
                    }
                });
            }
        }
    },
};

