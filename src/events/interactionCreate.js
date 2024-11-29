const { rateLimiter } = require('../utils/rateLimiter');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Rate Limiting for specific commands
        const limitedCommands = ['meme', 'tweet']; // Add commands to rate limit
        if (limitedCommands.includes(interaction.commandName)) {
            const allowed = rateLimiter(interaction.user.id, 1, 300000); // 1 command every 5 minutes
            if (!allowed) {
                return interaction.reply({ content: 'You are being rate limited. Try again later.', ephemeral: true });
            }
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
        }
    },
};


