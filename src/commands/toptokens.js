// src/commands/toptokens.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toptokens')
        .setDescription('Display the top Solana tokens with the highest trading volume'),
    async execute(interaction) {
        const solanaPlatformId = 'solana'; // Platform ID in CoinGecko for Solana

        try {
            // Fetch list of coins on Solana platform
            const coinsResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    order: 'volume_desc',
                    per_page: 10,
                    page: 1,
                    platform: solanaPlatformId,
                }
            });

            const coins = coinsResponse.data;

            if (!coins || coins.length === 0) {
                return interaction.reply({ content: 'No Solana tokens found.', ephemeral: true });
            }

            // Create a formatted message
            let message = '**Top Solana Tokens by 24h Volume:**\n';
            coins.forEach((coin, index) => {
                message += `${index + 1}. **${coin.name} (${coin.symbol.toUpperCase()})**\n   - Price: $${coin.current_price.toFixed(2)}\n   - 24h Volume: $${coin.total_volume.toLocaleString()}\n`;
            });

            await interaction.reply(message);
        } catch (error) {
            console.error('Error fetching top tokens:', error);
            await interaction.reply({ content: 'Failed to fetch top tokens.', ephemeral: true });
        }
    },
};
