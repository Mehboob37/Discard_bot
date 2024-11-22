const rateLimitMap = new Map();

function rateLimiter(userId, limit = 1, interval = 300000) { // 5 minutes
    const currentTime = Date.now();
    if (!rateLimitMap.has(userId)) {
        rateLimitMap.set(userId, []);
    }
    const timestamps = rateLimitMap.get(userId).filter(timestamp => currentTime - timestamp < interval);
    rateLimitMap.set(userId, timestamps);
    if (timestamps.length >= limit) {
        return false;
    }
    rateLimitMap.get(userId).push(currentTime);
    return true;
}

module.exports = { rateLimiter };
