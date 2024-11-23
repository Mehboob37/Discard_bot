
const fetch = require('node-fetch');
const { CronJob } = require('cron');


const tokenMapping = {
    SOLUSD: 'solana',
    BTCUSD: 'bitcoin',
    ETHUSD: 'ethereum',
    // Add more tokens as needed
};

const alertThresholds = {
    SOLUSD: 25, // Alert if SOL price exceeds $25
    BTCUSD: 30000, // Alert if BTC price exceeds $30,000
    ETHUSD: 1800, // Alert if ETH price exceeds $1,800
};

const targetChannelId = 'YOUR_CHANNEL_ID'; // Replace with your Discord channel ID

// Function to start auto price monitoring
function startAutoPriceMonitoring() {
    const job = new CronJob('* * * * *', async () => {
        console.log('Checking token prices...');
        for (const [ticker, tokenId] of Object.entries(tokenMapping)) {
            try {
                // Fetch token price from CoinGecko API
                const priceApiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`;
                const priceResponse = await fetch(priceApiUrl);

                if (!priceResponse.ok) {
                    throw new Error(`Failed to fetch price data for ${ticker} with status: ${priceResponse.status}`);
                }

                const priceData = await priceResponse.json();
                const tokenPrice = priceData[tokenId]?.usd;

                if (!tokenPrice) {
                    console.error(`Price data not available for ${ticker}`);
                    continue;
                }

                console.log(`[${ticker}] Current Price: $${tokenPrice}`);

                // Check if the token price exceeds the threshold
                if (tokenPrice >= alertThresholds[ticker]) {
                    console.log(`[ALERT] ${ticker} price has crossed the threshold! Current price: $${tokenPrice}`);
                    
                    // Send alert to specific Discord channel
                    const channel = await client.channels.fetch(targetChannelId);
                    if (channel) {
                        channel.send(`[ALERT] ${ticker} price has crossed your threshold! Current price: $${tokenPrice}`);
                    } else {
                        console.error('Channel not found.');
                    }
                }
            } catch (error) {
                console.error(`Error fetching price for ${ticker}:`, error.message);
            }
        }
    });

    job.start();
}
