// src/utils/riskAssessment.js
const axios = require('axios');

async function assessLiquidityLock(tokenId) {
    try {
        // Fetch token details from CoinGecko
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
        const data = response.data;
        const marketCap = data.market_data.market_cap.usd;
        if (marketCap > 1000000) {
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
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
        const data = response.data;

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
