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

function updateRank(userId, newRank) {
    const data = JSON.parse(fs.readFileSync(xpDataPath));
    if (data[userId].rank !== newRank) {
        data[userId].rank = newRank;
        fs.writeFileSync(xpDataPath, JSON.stringify(data, null, 2));
        return data[userId].rank;
    }
    return data[userId].rank;
}

module.exports = { addXP, getRank, updateRank };
