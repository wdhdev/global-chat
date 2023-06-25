const emoji = require("../../config.json").emojis;
const fs = require("fs");
const getDirs = require("../../util/getDirs");

module.exports = {
    name: "help",
    description: "Displays a list of all of my commands.",
    options: [
        {
            type: 3,
            required: false,
            name: "command",
            description: "Get info on a specific command."
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 10,
    enabled: true,
    hidden: false,
    async execute(interaction, client, Discord) {
        try {
            const cmd = interaction.options.getString("command");

            const validPermissions = client.validPermissions;

            const commands = [];

            async function pushRoot() {
                const files = fs.readdirSync(`./src/commands`).filter(file => file.endsWith(".js"));

                for(const file of files) {
                    const command = require(`../${file}`);

                    if(command.name) {
                        if(!command.enabled || command.hidden) continue;

                        if(command.default_member_permissions) {
                            if(!interaction.member.permissions.has(command.default_member_permissions)) continue;
                        }

                        commands.push(command.name);
                    } else {
                        continue;
                    }
                }
            }

            async function pushDir(dir) {
                const files = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith(".js"));

                for(const file of files) {
                    const command = require(`../${dir}/${file}`);

                    if(command.name) {
                        if(!command.enabled || command.hidden) continue;

                        if(command.default_member_permissions) {
                            if(!interaction.member.permissions.has(command.default_member_permissions)) continue;
                        }

                        commands.push(command.name);
                    } else {
                        continue;
                    }
                }
            }

            await pushRoot();
            (await getDirs("./src/commands")).forEach(dir => pushDir(dir));

            const cmds = [];

            for(const cmd of commands) {
                const info = client.commands.get(cmd);

                cmds.push(`</${cmd}:${client.commandIds.get(cmd)}>\n${emoji.reply} ${info.description}`);
            }

            const help = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setThumbnail(client.user.displayAvatarURL({ format: "png", dynamic: true }))
                .setTitle("Commands")
                .setDescription(cmds.join("\n"))
                .setTimestamp()

            const command = client.commands.get(cmd);

            if(command) {
                if(!command.enabled) return await interaction.editReply({ embeds: [help] });

                if(command.userPermissions.length) {
                    const invalidPerms = [];

                    for(const perm of command.userPermissions) {
                        if(!validPermissions.includes(perm)) continue;

                        if(!interaction.member?.permissions.has(perm)) invalidPerms.push(perm);
                    }

                    if(invalidPerms.length) return await interaction.editReply({ embeds: [help] });
                }

                const description = command.description ? command.description : "N/A";
                const userPermissions = command.userPermissions.length ? `\`${command.userPermissions.join("\`, \`")}\`` : "N/A";
                const botPermissions = command.botPermissions.length ? `\`${command.botPermissions.join("\`, \`")}\`` : "N/A";
                const cooldown = command.cooldown ? command.cooldown.length === 1 ? `\`${command.cooldown}\` second` : `${command.cooldown} seconds` : "None";

                const commandHelp = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`
                        **Command**
                        ${emoji.reply} </${command.name}:${client.commandIds.get(cmd)}>
                        **Description**
                        ${emoji.reply} ${description}
                        **Cooldown**
                        ${emoji.reply} ${cooldown}
                        **User Permissions**
                        ${emoji.reply} ${userPermissions}
                        **Bot Permissions**
                        ${emoji.reply} ${botPermissions}
                    `)
                    .setTimestamp()

                await interaction.editReply({ embeds: [commandHelp] });
                return;
            }

            await interaction.editReply({ embeds: [help] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}