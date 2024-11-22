const { SlashCommandBuilder } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tweet')
        .setDescription('Post a meme to Twitter')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Tweet message')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Image to attach')
                .setRequired(false)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const image = interaction.options.getAttachment('image');

        try {
            if (image) {
                const mediaId = await twitterClient.v1.uploadMedia(image.url);
                await twitterClient.v1.tweet(message, { media_ids: mediaId });
            } else {
                await twitterClient.v1.tweet(message);
            }

            await interaction.reply({ content: 'Tweet posted successfully!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to post tweet.', ephemeral: true });
        }
    },
};
