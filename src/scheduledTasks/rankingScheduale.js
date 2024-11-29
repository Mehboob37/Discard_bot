const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const xpDataPath = path.join(__dirname, '../../data/xp.json');

// Initialize XP data if not present
if (!fs.existsSync(xpDataPath)) {
    fs.writeFileSync(xpDataPath, JSON.stringify({}));
}

function getXP(userId) {
    const data = JSON.parse(fs.readFileSync(xpDataPath));
    return data[userId]?.xp || 0;
}

function addXP(userId, amount) {
    const data = JSON.parse(fs.readFileSync(xpDataPath));
    if (!data[userId]) data[userId] = { xp: 0, rank: 'Newbie' };
    data[userId].xp += amount;
    fs.writeFileSync(xpDataPath, JSON.stringify(data, null, 2));
    return data[userId].xp;
}

function getRank(xp) {
    if (xp <= 500) return 'Newbie';
    if (xp <= 1000) return 'Explorer';
    return 'Whale';
}

async function sendLeaderboardToChannel(client, channelId) {
    const data = JSON.parse(fs.readFileSync(xpDataPath));
    const sortedUsers = Object.entries(data).sort((a, b) => b[1].xp - a[1].xp).slice(0, 10);

    if (sortedUsers.length === 0) {
        console.log('No data available for the leaderboard.');
        return;
    }

    const leaderboardEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 XP Leaderboard')
        .setDescription('Here are the top 10 users with the highest XP!')
        .setFooter({ text: 'Keep chatting to climb the ranks!' })
        .setTimestamp();

    for (const [index, [userId, userData]] of sortedUsers.entries()) {
        try {
            // Fetch user directly from Discord API
            const user = await client.users.fetch(userId);
            const username = user?.username || 'Unknown User';
            const rankIcon = userData.rank === 'Newbie' ? '🌱' : userData.rank === 'Explorer' ? '🚀' : '🐳';

            leaderboardEmbed.addFields({
                name: `${index + 1}. ${username}`,
                value: `${rankIcon} **XP:** ${userData.xp} | **Rank:** ${userData.rank}`,
                inline: false,
            });
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error.message);
            leaderboardEmbed.addFields({
                name: `${index + 1}. Unknown User`,
                value: `🚫 **XP:** ${userData.xp} | **Rank:** ${userData.rank}`,
                inline: false,
            });
        }
    }

    const channel = await client.channels.fetch(channelId);
    if (channel) {
        channel.send({ embeds: [leaderboardEmbed] });
    } else {
        console.error('Channel not found.');
    }
}

module.exports = {
    sendLeaderboardToChannel,
    getXP,
    addXP,
    getRank
};
