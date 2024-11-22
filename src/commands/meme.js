const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const { profanityFilter } = require('../utils/profanityFilter');

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
                .setDescription('Create a custom meme')
                .addStringOption(option =>
                    option.setName('template')
                        .setDescription('Name of the meme template')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('top_text')
                        .setDescription('Top text for the meme')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('bottom_text')
                        .setDescription('Bottom text for the meme')
                        .setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('upload')
                .setDescription('Upload a custom image to create a meme')
                .addAttachmentOption(option =>
                    option.setName('image')
                        .setDescription('Image to use for the meme')
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

        if (subcommand === 'list') {
            const templatesDir = path.join(__dirname, '../../memes/templates');
            const templates = fs.readdirSync(templatesDir)
                .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
                .map(file => file.replace(/\.(png|jpg|jpeg)$/, ''));

            if (templates.length === 0) {
                return interaction.reply('No meme templates available.');
            }

            const templateList = templates.map(template => `• ${template}`).join('\n');

            await interaction.reply({
                content: `**Available Meme Templates:**\n${templateList}`,
                ephemeral: true
            });
        } else if (subcommand === 'create' || subcommand === 'upload') {
            // Defer the reply to allow more time for processing
            await interaction.deferReply({ ephemeral: false });

            let templatePath;
            let imageBuffer;

            try {
                if (subcommand === 'create') {
                    const templateName = interaction.options.getString('template').toLowerCase().replace(/\s+/g, '_');
                    const topText = interaction.options.getString('top_text') || '';
                    const bottomText = interaction.options.getString('bottom_text') || '';

                    // Profanity Filter
                    if (profanityFilter(topText) || profanityFilter(bottomText)) {
                        return interaction.editReply({ content: 'Inappropriate language detected!', ephemeral: true });
                    }

                    templatePath = path.join(__dirname, '../../memes/templates', `${templateName}.png`);
                    if (!fs.existsSync(templatePath)) {
                        return interaction.editReply({ content: 'Template not found.', ephemeral: true });
                    }

                    const canvas = Canvas.createCanvas(500, 500);
                    const ctx = canvas.getContext('2d');

                    const image = await Canvas.loadImage(templatePath);
                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    ctx.font = '30px Impact';
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                    ctx.textAlign = 'center';

                    // Top Text
                    if (topText) {
                        ctx.textBaseline = 'top';
                        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 10);
                        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 10);
                    }

                    // Bottom Text
                    if (bottomText) {
                        ctx.textBaseline = 'bottom';
                        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 10);
                        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 10);
                    }

                    imageBuffer = canvas.toBuffer('image/png');
                } else if (subcommand === 'upload') {
                    const image = interaction.options.getAttachment('image');
                    const topText = interaction.options.getString('top_text') || '';
                    const bottomText = interaction.options.getString('bottom_text') || '';

                    // Profanity Filter
                    if (profanityFilter(topText) || profanityFilter(bottomText)) {
                        return interaction.editReply({ content: 'Inappropriate language detected!', ephemeral: true });
                    }

                    const canvas = Canvas.createCanvas(500, 500);
                    const ctx = canvas.getContext('2d');

                    const loadedImage = await Canvas.loadImage(image.url);
                    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

                    ctx.font = '30px Impact';
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = 'black';
                    ctx.textAlign = 'center';

                    // Top Text
                    if (topText) {
                        ctx.textBaseline = 'top';
                        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 10);
                        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 10);
                    }

                    // Bottom Text
                    if (bottomText) {
                        ctx.textBaseline = 'bottom';
                        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 10);
                        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 10);
                    }

                    // Optional Watermark
                    const serverName = interaction.guild.name;
                    ctx.font = '15px Arial';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.textAlign = 'right';
                    ctx.fillText(`Powered by ${serverName}`, canvas.width - 10, canvas.height - 10);

                    imageBuffer = canvas.toBuffer('image/png');
                }

                await interaction.editReply({ files: [{ attachment: imageBuffer, name: 'meme.png' }] });
            } catch (error) {
                console.error(`Error creating meme: ${error}`);
                await interaction.editReply({ content: 'Failed to create meme.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        }
    },
};
