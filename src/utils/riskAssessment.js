// src/utils/riskAssessment.js
const axios = require('axios');

async function assessLiquidityLock(tokenId) {
    try {
        // Fetch token details from CoinGecko
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
        const data = response.data;

        // Example: Check if the token has liquidity pools on known DEXs
        // Note: CoinGecko may not provide explicit liquidity lock information
        // For a more accurate assessment, integrate with DEX APIs or Solana blockchain data

        // Placeholder logic: Assume liquidity is locked if market cap > threshold
        const marketCap = data.market_data.market_cap.usd;
        if (marketCap > 1000000) { // Example threshold
            return 'Low Risk';
        } else {
            return 'High Risk';
        }
    } catch (error) {
        console.error(`Error assessing liquidity lock for ${tokenId}:`, error);
        return 'Unknown';
    }
}

async function assessDeveloperActivity(tokenId) {
    try {
        // Fetch token details to get developer wallet addresses if available
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
        const data = response.data;

        // Example: Assume developer wallet is listed under developers' section
        // CoinGecko may not provide developer wallet info directly

        // Placeholder logic: If development activity is ongoing, consider it low risk
        const developers = data.developer_data;
        if (developers && developers.forks > 0) { // Example metric
            return 'Low Risk';
        } else {
            return 'High Risk';
        }
    } catch (error) {
        console.error(`Error assessing developer activity for ${tokenId}:`, error);
        return 'Unknown';
    }
}

async function getRiskScore(tokenId) {
    const liquidityRisk = await assessLiquidityLock(tokenId);
    const developerRisk = await assessDeveloperActivity(tokenId);

    // Simple aggregation
    if (liquidityRisk === 'High Risk' || developerRisk === 'High Risk') {
        return 'High Risk';
    } else if (liquidityRisk === 'Low Risk' && developerRisk === 'Low Risk') {
        return 'Low Risk';
    } else {
        return 'Moderate Risk';
    }
}

module.exports = { getRiskScore };
