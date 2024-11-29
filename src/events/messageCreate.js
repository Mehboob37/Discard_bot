const fs = require('fs');
const path = require('path');
const { Events, EmbedBuilder } = require('discord.js');
const { addXP, getRank, updateRank } = require('../utils/xpSystem');
const { checkProfanity } = require('../utils/profanityFilter');
const { isSpam, isPhishing } = require('../utils/moderationFilters');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;
        console.log(message.content)

        const configPath = path.join(__dirname, '../../config/config.json');
        const config = JSON.parse(fs.readFileSync(configPath));

        // XP System
        const userId = message.author.id;
        const xp = addXP(userId, 10); // +10 XP per message

        const newRank = getRank(xp);
        const oldRank = updateRank(userId, newRank);

        if (newRank !== oldRank) {
            const rankChannel = message.guild.channels.cache.get(config.rankUpdateChannel) || message.guild.channels.cache.find(channel => channel.name === 'rank-updates');
            if (rankChannel) {
                const rankEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎉 Rank Up!')
                    .setDescription(`**${message.author.username}** has reached the rank of **${newRank}**! Keep it up!`)
                    .setTimestamp();

                rankChannel.send({ embeds: [rankEmbed] });
            }
        }

        // Moderation
        const prohibitedWords = config.prohibitedWords || [];
        const phishingDomains = config.phishingDomains || [];

        let hasProhibitedContent = false;
        let reason = '';

        // Check for prohibited words
        if (prohibitedWords.some(word => message.content.toLowerCase().includes(word))) {
            hasProhibitedContent = true;
            reason = '🚫 Inappropriate language';
        }

        // Check for phishing links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content.match(urlRegex);

        if (urls) {
            for (const url of urls) {
                try {
                    const domain = new URL(url).hostname;
                    if (phishingDomains.includes(domain)) {
                        hasProhibitedContent = true;
                        reason = '🛑 Phishing link detected';
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
        }

        if (hasProhibitedContent) {
            await message.delete();

            // Warn the user
            const warningEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Warning')
                .setDescription(`${message.author}, your message was removed due to ${reason}. Please adhere to the server rules.`)
                .setTimestamp();

            await message.channel.send({ embeds: [warningEmbed] });

            // Log to mod-logs
            const logChannel = message.guild.channels.cache.get(config.modLogsChannel) || message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('📝 Moderation Log')
                    .setDescription(`**Action:** Deleted Message\n**User:** ${message.author.tag}\n**Reason:** ${reason}\n**Content:** "${message.content}"`)
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};
