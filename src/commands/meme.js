const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Meme related commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List available meme templates')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a meme from a template')
                .addStringOption(option =>
                    option.setName('template')
                        .setDescription('Meme template ID')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('top_text')
                        .setDescription('Top text for the meme')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('bottom_text')
                        .setDescription('Bottom text for the meme')
                        .setRequired(false))
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Restrict command to a specific channel (e.g., #meme-channel)
        const allowedChannelId = '1309475707910488145'; // Replace with the channel ID where memes can be created
        if (interaction.channelId !== allowedChannelId) {
            return interaction.reply({ content: 'This command can only be used in the #meme-channel.', ephemeral: true });
        }

        if (subcommand === 'list') {
            // Fetch meme templates from Imgflip
            try {
                const response = await fetch('https://api.imgflip.com/get_memes');
                const data = await response.json();

                if (!data.success) {
                    return interaction.reply({ content: 'Failed to fetch memes.', ephemeral: true });
                }

                const memes = data.data.memes.slice(0, 50); // Limit to 50 memes
                const pages = [];
                let pageContent = '';

                memes.forEach((meme, index) => {
                    // Format the meme details (name, ID, and meme link)
                    const memeLine = `**Template Name:** ${meme.name}\n**Template ID:** ${meme.id}\n![Meme Image](${meme.url})\nUse the template ID to create a meme!\n\n`;

                    // If the page content length exceeds the Discord message character limit, push the current page and reset the page content
                    if ((pageContent + memeLine).length > 1900) {
                        pages.push(pageContent);
                        pageContent = '';
                    }
                    pageContent += memeLine;
                });
                pages.push(pageContent); // Add the last page

                await interaction.reply({ content: pages[0], ephemeral: true });

                // Handle pagination if there are multiple pages
                if (pages.length > 1) {
                    for (let i = 1; i < pages.length; i++) {
                        await interaction.followUp({ content: pages[i], ephemeral: true });
                    }
                }
            } catch (error) {
                console.error(`Error fetching meme list: ${error}`);
                await interaction.reply({ content: 'Failed to fetch meme list.', ephemeral: true });
            }
        } else if (subcommand === 'create') {
            // Create a meme using Imgflip API
            const templateId = interaction.options.getString('template');
            const topText = interaction.options.getString('top_text') || '';
            const bottomText = interaction.options.getString('bottom_text') || '';

            const username = 'ghulamkabira622@gmail.com'; // Replace with Imgflip username
            const password = 'v6EJn94UyUK@9w7'; // Replace with Imgflip password

            try {
                const response = await fetch('https://api.imgflip.com/caption_image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_id: templateId,
                        username,
                        password,
                        text0: topText,
                        text1: bottomText,
                    }),
                });
                const data = await response.json();

                if (!data.success) {
                    return interaction.reply({ content: 'Failed to create meme. Ensure the template ID is correct.', ephemeral: true });
                }

                const memeUrl = data.data.url;
                await interaction.reply({ content: `Here is your meme: ${memeUrl}` });
            } catch (error) {
                console.error(`Error creating meme: ${error}`);
                await interaction.reply({ content: 'Failed to create meme.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
