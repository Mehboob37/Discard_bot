// src/utils/tokenTracker.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tokensFilePath = path.join(__dirname, '../../data/tokens.json');

// Initialize tokens.json if it doesn't exist
if (!fs.existsSync(tokensFilePath)) {
    fs.writeFileSync(tokensFilePath, JSON.stringify([]));
}

async function fetchAllTokens() {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true');
        return response.data;
    } catch (error) {
        console.error('Error fetching tokens from CoinGecko:', error);
        return [];
    }
}

function getStoredTokens() {
    const data = fs.readFileSync(tokensFilePath);
    return JSON.parse(data);
}

function storeTokens(tokens) {
    fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
}

async function getNewTokens() {
    const currentTokens = await fetchAllTokens();
    const storedTokens = getStoredTokens();

    const storedTokenIds = new Set(storedTokens.map(token => token.id));
    const newTokens = currentTokens.filter(token => !storedTokenIds.has(token.id));

    // Update stored tokens with the current tokens
    storeTokens(currentTokens);

    return newTokens;
}

module.exports = { getNewTokens };
