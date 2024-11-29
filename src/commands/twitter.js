const { SlashCommandBuilder } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const client = new TwitterApi({
    appKey: 'aHyS6YC6hISCZKRXM6qWcP2Hv',
    appSecret: 'DM1dCqWdLaiRUIdWsxlWBNGShNmgruHQyrzFwKYbYZIMQJDZ7M',
    accessToken: '1862371100702736384-MGzmFCg9xUYK7pSnbDRzQbpT4QG6sN',
    accessSecret:'Eh3n1QjQTjOcZKPrcOdis2zKtg0pZ6zeVpoZdD6T0TdP2',
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tweet')
        .setDescription('Post a tweet to Twitter')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Tweet message')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');

        try {
            await interaction.deferReply({ ephemeral: true }); // Acknowledge the command

            // Post the text-only tweet

           const twitterClient = client.readWrite;
            await twitterClient.v2.tweet(message);

            // Confirm success to the user
            await interaction.editReply('Tweet posted successfully!');
        } catch (error) {
            console.error(error);

            // Handle error and notify the user
            await interaction.editReply('Failed to post tweet. Please try again later.');
        }
    },
};
