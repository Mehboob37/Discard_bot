const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');
const { addXP, getRank, updateRank } = require('../utils/xpSystem');
const { checkProfanity } = require('../utils/profanityFilter');
const { isSpam, isPhishing } = require('../utils/moderationFilters');

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
       
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
                rankChannel.send(`${message.author.username} has reached the rank of **${newRank}**!`);
            }
        }

        // Moderation
        const prohibitedWords = config.prohibitedWords || [];
        const phishingDomains = config.phishingDomains || [];
        let hasProhibitedContent = false;
        let reason = '';

        // Check for prohibited words
        // Check for prohibited words
        if (prohibitedWords.some(word => message.content.toLowerCase().includes(word.toLowerCase()))) {
            console.log('Prohibited word detected');
            hasProhibitedContent = true;
            reason = 'Inappropriate language';
            
            async function deleteMessageWithRetry(message, retries = 3, delay = 1000) {
                if (!message || typeof message.delete !== 'function') {
                    throw new TypeError('Invalid message object passed to deleteMessageWithRetry');
                }
                for (let i = 0; i < retries; i++) {
                    try {
                        await message.delete();
                        console.log('Message deleted successfully');
                        return;
                    } catch (error) {
                        console.error(`Attempt ${i + 1} failed to delete message:`, error);
                        if (i === retries - 1) {
                            console.error('All retries failed. Message not deleted.');
                            throw error;
                        }
                        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
                    }
                }
            }
            
            
            
        }

       
        // Check for phishing links
        // const urlRegex = /(https?:\/\/[^\s]+)/g;
        // const urls = message.content.match(urlRegex);
        // console.log('matched',urls)
        // if (urls) {
        //     for (const url of urls) {
        //         try {
        //             const domain = new URL(url).hostname;
        //             if (phishingDomains.includes(domain)) {
        //                 hasProhibitedContent = true;
        //                 reason = 'Phishing link detected';
        //                 console.log('ok')
        //                 console.log(hasProhibitedContent)
        //                 break;
        //             }
        //         } catch (error) {
        //             continue;
        //         }
        //     }
        // }
        // if (hasProhibitedContent) {
        //     await message.delete();
        //     const warning = await message.channel.send(`${message.author}, your message was removed due to ${reason}. Please adhere to the server rules.`);

        //     // Log to mod-logs
        //     const logChannel = message.guild.channels.cache.get(config.modLogsChannel) || message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
        //     if (logChannel) {
        //         logChannel.send(`Deleted message from ${message.author.tag} for ${reason}. Content: "${message.content}"`);
        //     }

        //     // Optionally, implement warnings and bans here
        // }
    },
};
