const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Import fetch
const technicalindicators = require('technicalindicators'); // Import technicalindicators
const { CronJob } = require('cron'); // For price alerts

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
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('alert')
                .setDescription('Set price alert for Solana (SOL) or another token.')
                .setRequired(false)),
    async execute(interaction) {
        const ticker = interaction.options.getString('ticker').toUpperCase();
        const timeframe = interaction.options.getString('timeframe');
        const alertPrice = interaction.options.getInteger('alert');

        try {
            // Acknowledge the command immediately
            await interaction.deferReply();

            // Construct the API URL for fetching price data
            const apiUrl = `https://api.coingecko.com/api/v3/coins/${ticker.toLowerCase()}/market_chart?vs_currency=usd&days=1`;
            console.log(`Requesting data from: ${apiUrl}`);

            // Fetch data using node-fetch
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched data:', data);

            // Extract and validate OHLC data
            const ohlcData = data?.prices;
            if (!ohlcData || ohlcData.length === 0) {
                return interaction.followUp({ content: 'No price data available for this token.', ephemeral: true });
            }

            const closePrices = ohlcData.map(item => item[1]);
            console.log('Close Prices:', closePrices);

            // Calculate RSI
            const rsiInput = { values: closePrices, period: 14 };
            const rsiArray = technicalindicators.rsi(rsiInput);
            const rsi = rsiArray.length ? rsiArray.slice(-1)[0] : undefined;
            console.log('RSI:', rsi);

            // Calculate MACD
            const macdInput = {
                values: closePrices,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9
            };
            const macdArray = technicalindicators.macd(macdInput);
            const macd = macdArray.length ? macdArray.slice(-1)[0] : undefined;
            console.log('MACD:', macd);

            // Calculate SMA
            const smaInput = { values: closePrices, period: 50 };
            const smaArray = technicalindicators.sma(smaInput);
            const sma = smaArray.length ? smaArray.slice(-1)[0] : undefined;
            console.log('SMA:', sma);

            // Construct TradingView chart URL
            const chartUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${ticker}&interval=${timeframe}`;

            // Respond with chart and indicators
            await interaction.followUp({
                content: `Here is your chart for ${ticker} (${timeframe}): ${chartUrl}\n` +
                         `Price: $${closePrices[closePrices.length - 1]?.toFixed(2) || 'N/A'}\n` +
                         `RSI: ${rsi?.toFixed(2) || 'N/A'}\n` +
                         `MACD: ${macd ? `${macd.MACD?.toFixed(2)} (MACD Line) / ${macd.signal?.toFixed(2)} (Signal Line)` : 'N/A'}\n` +
                         `50-period SMA: ${sma?.toFixed(2) || 'N/A'}`
            });

            // Start price alert if requested
            if (alertPrice) {
                startPriceAlert(ticker, alertPrice, interaction);
            }
        } catch (error) {
            console.error('Error fetching data or calculating indicators:', error.message);
            await interaction.followUp({ content: 'Failed to fetch data or calculate indicators.', ephemeral: true });
        }
    },
};

// Function to monitor and trigger price alerts
function startPriceAlert(ticker, alertPrice, interaction) {
    const job = new CronJob('*/1 * * * *', async () => {
        try {
            const priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ticker.toLowerCase()}&vs_currencies=usd`;
            const priceResponse = await fetch(priceApiUrl);
            if (!priceResponse.ok) {
                throw new Error(`Failed to fetch price data with status: ${priceResponse.status}`);
            }

            const priceData = await priceResponse.json();
            const tokenPrice = priceData[ticker.toLowerCase()]?.usd;

            if (!tokenPrice) {
                console.error('Price data not available');
                return;
            }

            if (tokenPrice >= alertPrice) {
                await interaction.followUp({ content: `Alert: ${ticker} price has crossed your threshold! Current price: $${tokenPrice}` });
                job.stop();
            }
        } catch (error) {
            console.error('Error checking price:', error.message);
        }
    });

    job.start();
}
