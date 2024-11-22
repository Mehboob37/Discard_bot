const spamPatterns = [/spamword1/i, /spamword2/i]; // Add actual spam patterns
const phishingDomains = ['phishingsite.com', 'malicious.com']; // Add actual phishing domains

function isSpam(messageContent) {
    return spamPatterns.some(pattern => pattern.test(messageContent));
}

function isPhishing(url) {
    try {
        const domain = new URL(url).hostname;
        return phishingDomains.includes(domain);
    } catch (error) {
        return false;
    }
}

module.exports = { isSpam, isPhishing };
