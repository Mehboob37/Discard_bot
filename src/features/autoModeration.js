const { Events } = require('discord.js');
const config = require('../../config/config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const { prohibitedWords, phishingDomains, modLogsChannel } = config;

        // Check for prohibited words
        if (prohibitedWords.some(word => message.content.toLowerCase().includes(word))) {
           
            await message.delete();
            const warningMessage = `Your message contained prohibited language and was removed.`;
            await message.channel.send({ content: warningMessage, ephemeral: true });

            // Log the action
            const modLogsChannelObj = message.guild.channels.cache.find(channel => channel.name === modLogsChannel);
            if (modLogsChannelObj) {
                modLogsChannelObj.send(`Message from ${message.author.tag} was deleted for containing prohibited words.`);
            }
        }

        // Check for phishing domains
        if (phishingDomains.some(domain => message.content.toLowerCase().includes(domain))) {
            await message.delete();
            const warningMessage = `Your message contained a phishing link and was removed.`;
            await message.channel.send({ content: warningMessage, ephemeral: true });

            // Log the action
            const modLogsChannelObj = message.guild.channels.cache.find(channel => channel.name === modLogsChannel);
            if (modLogsChannelObj) {
                modLogsChannelObj.send(`Message from ${message.author.tag} was deleted for containing a phishing link.`);
            }
        }
    },
};

