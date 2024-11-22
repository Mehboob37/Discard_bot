const badWords = ['badword1', 'badword2', 'badword3']; // Replace with actual profanity list

function profanityFilter(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
}

module.exports = { profanityFilter };
