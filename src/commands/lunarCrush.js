const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sentiment')
        .setDescription('Get market and social data for a cryptocurrency')
        .addStringOption(option =>
            option.setName('token')
                .setDescription('Token ticker symbol, e.g., solana (sol)')
                .setRequired(true)),
    async execute(interaction) {
        const token = interaction.options.getString('token').toLowerCase(); // CoinGecko uses lowercase

        try {
            // Fetch coin data from CoinGecko for Solana (static endpoint for Solana only)
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/solana');

            const data = response.data;

            if (!data) {
                return interaction.reply({ content: 'Data not available for this token.', ephemeral: true });
            }

            // Extract relevant data from CoinGecko API response
            const marketData = data.market_data || {};
            const communityData = data.community_data || {};

            // Sentiment Analysis (Using community sentiment data)
            const sentimentVotesUp = communityData.sentiment_votes_up_percentage || 'N/A';
            const sentimentVotesDown = communityData.sentiment_votes_down_percentage || 'N/A';
            const sentiment = sentimentVotesUp > sentimentVotesDown ? 'Bullish' : 'Bearish';

            // Social Volume Data (Including Twitter followers and Reddit subscribers)
            const socialVolume = communityData.twitter_followers || 'N/A';
            const redditSubscribers = communityData.reddit_subscribers || 'N/A';

            // Trending Token - We can track Twitter followers and Reddit subscribers for engagement
            const socialEngagement = communityData.twitter_followers || communityData.reddit_subscribers || 'N/A';

            // Fetch trending tokens from CoinGecko API (you can customize this)
            const trendingResponse = await axios.get('https://api.coingecko.com/api/v3/search/trending');
            const trendingData = trendingResponse.data.coins || [];

            // Filter out Solana (if it exists) and get top trending tokens
            const topTrendingTokens = trendingData.slice(0, 5).map(coin => {
                return `**${coin.item.name}** (ID: ${coin.item.id}) - Market Cap Rank: ${coin.item.market_cap_rank}`;
            });

            // Reply with the fetched data
            await interaction.reply(
                `**${data.name} (${data.symbol.toUpperCase()})**\n` +
                `- Sentiment: ${sentiment} (Upvotes: ${sentimentVotesUp}%, Downvotes: ${sentimentVotesDown}%)\n` +
                `- Twitter Followers: ${socialVolume}\n` +
                `- Reddit Subscribers: ${redditSubscribers}\n` +
                `- Social Engagement (Twitter + Reddit): ${socialEngagement}\n\n` +
                `**Trending Tokens (Top 5)**:\n` +
                topTrendingTokens.join('\n')
            );
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to fetch data. Please check the token symbol or try again later.', ephemeral: true });
        }
    },
};
