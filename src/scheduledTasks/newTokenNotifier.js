// src/scheduledTasks/newTokenNotifier.js
const cron = require('node-cron');
const { getNewTokens } = require('../utils/tokenTracker');
const { getRiskScore } = require('../utils/riskAssessment');
const axios = require('axios');

module.exports = function(client) {
    // Schedule the task to run every hour
    cron.schedule('* * * * *', async () => {
        console.log('Checking for new Solana tokens...');

        const newTokens = await getNewTokens();

        if (newTokens.length === 0) {
            console.log('No new tokens found.');
            return;
        }

        // Fetch the channel where notifications will be sent
        const channel = client.channels.cache.find(channel => channel.name === 'fresh-tokens'); // Replace with your channel name or ID

        if (!channel) {
            console.error('Notification channel not found.');
            return;
        }

        for (const token of newTokens) {
            const riskScore = await getRiskScore(token.id);

            const embed = {
                color: riskScore === 'High Risk' ? 0xFF0000 : (riskScore === 'Low Risk' ? 0x00FF00 : 0xFFFF00),
                title: `${token.name} (${token.symbol.toUpperCase()})`,
                url: `https://solscan.io/token/${token.id}`,
                fields: [
                    {
                        name: 'Contract Address',
                        value: `\`${token.id}\``,
                        inline: false,
                    },
                    {
                        name: 'Risk Assessment',
                        value: riskScore,
                        inline: false,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: 'Fresh Tokens Bot',
                },
            };

            channel.send({ embeds: [embed] });
        }

        console.log(`Notified about ${newTokens.length} new tokens.`);
    });
};
