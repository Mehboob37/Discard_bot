const fs = require('fs');
const path = require('path');

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
        return console.log('No data available for the leaderboard.');
    }

    let leaderboard = '**XP Leaderboard:**\n';
    sortedUsers.forEach(([userId, userData], index) => {
        const user = client.users.cache.get(userId)?.username || 'Unknown User';
        leaderboard += `${index + 1}. ${user} - ${userData.xp} XP (${userData.rank})\n`;
    });

    const channel = await client.channels.fetch(channelId);
    if (channel) {
        channel.send(leaderboard);
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
