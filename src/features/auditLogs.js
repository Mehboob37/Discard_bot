
const { Events } = require('discord.js');
const config = require('../../config/config.json');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        const { modLogsChannel } = config;
        const modLogsChannelObj = newMember.guild.channels.cache.find(channel => channel.name === modLogsChannel);

        if (!modLogsChannelObj) return;

        // Example: Logging role changes
        if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

            if (addedRoles.size > 0) {
                modLogsChannelObj.send(`${newMember.user.tag} was assigned the role(s): ${addedRoles.map(role => role.name).join(', ')}`);
            }

            if (removedRoles.size > 0) {
                modLogsChannelObj.send(`${newMember.user.tag} had the role(s) removed: ${removedRoles.map(role => role.name).join(', ')}`);
            }
        }
    },
};
