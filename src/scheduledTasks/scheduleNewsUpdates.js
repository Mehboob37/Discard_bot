const cron = require('node-cron');
const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const parser = new Parser();

const lastNewsPath = path.join(__dirname, '../../data/lastNews.json');

const newsChannelId = '1309362051675721758';

async function fetchAndPostNews(client) {
    try {
        const feed = await parser.parseURL('https://decrypt.co/feed'); // Example RSS feed
        const solanaNews = feed.items.filter(item => item.title.toLowerCase().includes('solana'));
        // console.log(solanaNews)
        if (solanaNews.length === 0) return;

        const latestNews = solanaNews[0];
        const lastNews = fs.existsSync(lastNewsPath) ? JSON.parse(fs.readFileSync(lastNewsPath)) : null;
        console.log(latestNews)
        if (lastNews?.title === latestNews.title){
            console.log('no new news')
            return
        }

           

        const newsChannel = client.channels.cache.get(newsChannelId);
        if (!newsChannel) {
            console.error('News channel not found.');
            return;
        }

        await newsChannel.send(`**${latestNews.title}**\n${latestNews.link}`);
        fs.writeFileSync(lastNewsPath, JSON.stringify({ title: latestNews.title }));

        console.log('Latest Solana news posted.');
    } catch (error) {
        console.error('Error fetching or posting news:', error);
    }
}

// Schedule the cron job to run every 10 minutes
// function scheduleNewsUpdates(client) {
//     cron.schedule('* * * * *', () => {
//         console.log('Running scheduled task to fetch Solana news...');
//         fetchAndPostNews(client);
//     });
// }

module.exports = fetchAndPostNews;