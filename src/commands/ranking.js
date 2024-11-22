const { SlashCommandBuilder } = require('discord.js');
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Ranking system commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Show the XP leaderboard')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'leaderboard') {
            const data = JSON.parse(fs.readFileSync(xpDataPath));
            const sortedUsers = Object.entries(data).sort((a, b) => b[1].xp - a[1].xp).slice(0, 10);

            if (sortedUsers.length === 0) {
                return interaction.reply('No data available for the leaderboard.');
            }

            let leaderboard = '**XP Leaderboard:**\n';
            sortedUsers.forEach(([userId, userData], index) => {
                const user = interaction.guild.members.cache.get(userId)?.user.username || 'Unknown User';
                leaderboard += `${index + 1}. ${user} - ${userData.xp} XP (${userData.rank})\n`;
            });

            await interaction.reply({ content: leaderboard, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
