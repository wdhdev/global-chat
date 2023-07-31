import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { createLog } from "../../util/logger";
import { emojis as emoji } from "../../config";

import User from "../../models/User";

const command: Command = {
    name: "add-nickname",
    description: "[MODERATOR ONLY] Add a nickname to a user.",
    options: [
        {
            type: 6,
            name: "user",
            description: "The user to add the nickname to.",
            required: true
        },

        {
            type: 3,
            name: "nickname",
            description: "The nickname to add to the user.",
            min_length: 1,
            max_length: 32,
            required: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: ["mod"],
    cooldown: 0,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: false,
    async execute(interaction: CommandInteraction, client: ExtendedClient & any, Discord: any) {
        try {
            const modLogsChannel = client.channels.cache.get(client.config_channels.modLogs);

            const user = interaction.options.getUser("user");
            const nickname = interaction.options.get("nickname").value as string;

            const userData = await User.findOne({ _id: user.id });

            if(!userData) {
                await new User({ _id: user.id, nickname: nickname }).save();
            } else {
                await User.findOneAndUpdate({ _id: user.id }, { nickname: nickname });
            }

            const added = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} ${user} has recieved the nickname \`${nickname}\`.`)

            await interaction.editReply({ embeds: [added] });

            await createLog(user.id, null, "nicknameAdd", nickname, null, interaction.user.id);

            const log = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
                .setTitle("🪪 Nickname Changed")
                .addFields (
                    { name: "Old Nickname", value: `\`${userData?.nickname}\`` || "*None*", inline: true },
                    { name: "New Nickname", value: `\`${nickname}\``, inline: true },
                    { name: "User", value: `${user}` }
                )
                .setTimestamp()

            modLogsChannel.send({ embeds: [log] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
