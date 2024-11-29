const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Import fetch
const technicalindicators = require('technicalindicators'); // Import technicalindicators

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chart')
        .setDescription('Generate TradingView price chart and display technical indicators')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Ticker symbol, e.g., SOLUSD')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('timeframe')
                .setDescription('Timeframe, e.g., 1h')
                .setRequired(true)),
    async execute(interaction) {
        const ticker = interaction.options.getString('ticker').toUpperCase();
        const timeframe = interaction.options.getString('timeframe');
        const tokenId = mapTickerToCoinGeckoId(ticker);

        if (!tokenId) {
            return interaction.reply({
                content: `The ticker ${ticker} is not supported.`,
                ephemeral: true
            });
        }

        try {
            // Acknowledge the command
            await interaction.deferReply();

            // Fetch data with retry logic
            const apiUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=1`;
            const data = await fetchWithRetry(apiUrl, 3);

            // Validate and process price data
            const ohlcData = data?.prices;
            if (!ohlcData || ohlcData.length === 0) {
                return interaction.followUp({ content: 'No price data available for this token.', ephemeral: true });
            }

            const closePrices = ohlcData.map(item => item[1]);

            // Calculate indicators
            const indicators = calculateIndicators(closePrices);

            // Construct TradingView chart URL
            const chartUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker}&interval=${timeframe}`;

            // Respond with chart and indicators
            await interaction.followUp({
                content: `Here is your chart for ${ticker} (${timeframe}): ${chartUrl}\n` +
                    `Price: $${closePrices[closePrices.length - 1]?.toFixed(2) || 'N/A'}\n` +
                    `RSI: ${indicators.rsi?.toFixed(2) || 'N/A'}\n` +
                    `MACD: ${indicators.macd || 'N/A'}\n` +
                    `50-period SMA: ${indicators.sma?.toFixed(2) || 'N/A'}`,
            });
        } catch (error) {
            console.error('Error processing chart command:', error.message);
            await interaction.followUp({ content: 'Failed to fetch data or calculate indicators.', ephemeral: true });
        }
    },
};

// Map supported tickers to CoinGecko IDs
function mapTickerToCoinGeckoId(ticker) {
    const mapping = {
        SOLUSD: 'solana',
        BTCUSD: 'bitcoin',
        ETHUSD: 'ethereum',
        // Add more mappings as needed
    };

    return mapping[ticker];
}

// Retry logic for API requests
async function fetchWithRetry(url, retries) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API request failed with status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error; // Throw error after final retry
            console.warn(`Retrying... (${i + 1}/${retries})`);
        }
    }
}

// Calculate indicators
function calculateIndicators(closePrices) {
    try {
        // RSI
        const rsiInput = { values: closePrices, period: 14 };
        const rsiArray = technicalindicators.rsi(rsiInput);
        const rsi = rsiArray.length ? rsiArray.slice(-1)[0] : undefined;

        // MACD
        const macdInput = {
            values: closePrices,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
        };
        const macdArray = technicalindicators.macd(macdInput);
        const macd = macdArray.length ? `${macdArray.slice(-1)[0]?.MACD?.toFixed(2)} (MACD Line) / ${macdArray.slice(-1)[0]?.signal?.toFixed(2)} (Signal Line)` : undefined;

        // SMA
        const smaInput = { values: closePrices, period: 50 };
        const smaArray = technicalindicators.sma(smaInput);
        const sma = smaArray.length ? smaArray.slice(-1)[0] : undefined;

        return { rsi, macd, sma };
    } catch (error) {
        console.error('Error calculating indicators:', error.message);
        return { rsi: undefined, macd: undefined, sma: undefined };
    }
}
