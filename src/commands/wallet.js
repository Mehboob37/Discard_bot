const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const watchlistPath = path.join(__dirname, '../../data/watchlists.json');

// Initialize watchlists if not present
if (!fs.existsSync(watchlistPath)) {
    fs.writeFileSync(watchlistPath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Manage wallet watchlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a wallet to your watchlist')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to watch')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a wallet from your watchlist')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to remove')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your watched wallets')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const address = interaction.options.getString('address')?.toLowerCase();
        console.log('address',address)
        let watchlists = JSON.parse(fs.readFileSync(watchlistPath));

        if (!watchlists[userId]) {
            watchlists[userId] = [];
        }

        if (subcommand === 'add') {
            if (!address) {
                return interaction.reply({ content: 'Please provide a wallet address.', ephemeral: true });
            }

            if (watchlists[userId].includes(address)) {
                return interaction.reply({ content: 'This wallet is already in your watchlist.', ephemeral: true });
            }

            watchlists[userId].push(address);
            fs.writeFileSync(watchlistPath, JSON.stringify(watchlists, null, 2));

            await interaction.reply({ content: `Wallet ${address} has been added to your watchlist.`, ephemeral: true });
        } else if (subcommand === 'remove') {
            if (!address) {
                return interaction.reply({ content: 'Please provide a wallet address.', ephemeral: true });
            }

            if (!watchlists[userId].includes(address)) {
                return interaction.reply({ content: 'This wallet is not in your watchlist.', ephemeral: true });
            }

            watchlists[userId] = watchlists[userId].filter(addr => addr !== address);
            fs.writeFileSync(watchlistPath, JSON.stringify(watchlists, null, 2));

            await interaction.reply({ content: `Wallet ${address} has been removed from your watchlist.`, ephemeral: true });
        } else if (subcommand === 'list') {
            const wallets = watchlists[userId];
            if (!wallets || wallets.length === 0) {
                return interaction.reply({ content: 'Your watchlist is empty.', ephemeral: true });
            }

            const walletList = wallets.map(addr => `• ${addr}`).join('\n');

            await interaction.reply({ content: `**Your Watched Wallets:**\n${walletList}`, ephemeral: true });
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
