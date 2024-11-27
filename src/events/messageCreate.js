const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');
const { addXP, getRank, updateRank } = require('../utils/xpSystem');
const { isSpam } = require('../utils/moderationFilters');

const warnings = new Map(); // Track warnings for users

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;

        const configPath = path.join(__dirname, '../../config/config.json');
        const config = JSON.parse(fs.readFileSync(configPath));
        console.log(config);  // Log the config to ensure it's loaded correctly

        // XP System
        const userId = message.author.id;
        const xp = addXP(userId, 10); // Award XP
        const newRank = getRank(xp);
        const oldRank = updateRank(userId, newRank);

        if (newRank !== oldRank) {
            const rankChannel = message.guild.channels.cache.get(config.rankUpdateChannel);
            if (rankChannel) {
                rankChannel.send(`${message.author.username} has reached the rank of **${newRank}**!`);
            }
        }

        // Moderation checks
        const prohibitedWords = config.prohibitedWords || [];
        const phishingDomains = config.phishingDomains || [];
        let hasProhibitedContent = false;
        let reason = '';

        // Check for prohibited words
        console.log(`Checking message content: ${message.content}`);
        if (prohibitedWords.some(word => message.content.toLowerCase().includes(word))) {
            console.log('Prohibited word detected!');
            hasProhibitedContent = true;
            reason = 'Inappropriate language';
        }

        // Check for phishing links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = message.content.match(urlRegex);
        if (urls) {
            console.log('URLs detected:', urls);
            for (const url of urls) {
                const domain = new URL(url).hostname;
                console.log('Domain extracted:', domain);
                if (phishingDomains.includes(domain)) {
                    hasProhibitedContent = true;
                    reason = 'Phishing link detected';
                    break;
                }
            }
        }

        // Check for spam
        if (isSpam(message.content)) {
            hasProhibitedContent = true;
            reason = 'Spam detected';
        }

        if (hasProhibitedContent) {
            console.log(`Deleting message: ${message.content}`);
            await message.delete();

            // Issue a warning
            const userWarnings = warnings.get(userId) || 0;
            warnings.set(userId, userWarnings + 1);
            const warningMessage = `${message.author}, your message was removed due to ${reason}. Warning #${userWarnings + 1}. Continued violations may result in a temporary ban.`;
            await message.channel.send(warningMessage);

            // Log to mod-logs channel
            const logChannel = message.guild.channels.cache.get(config.modLogsChannel);
            if (logChannel) {
                logChannel.send(`Deleted message from ${message.author.tag} for ${reason}. Content: "${message.content}"`);
            }

            // Temporary ban after exceeding warning limit
            const warningLimit = config.warningLimit || 3;
            if (warnings.get(userId) >= warningLimit) {
                const member = await message.guild.members.fetch(userId);
                await member.timeout(60 * 60 * 1000); // 1-hour timeout
                warnings.set(userId, 0); // Reset warnings after ban
                if (logChannel) {
                    logChannel.send(`${message.author.tag} was temporarily banned for exceeding the warning limit.`);
                }
            }
        }
    },
};
