import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import { noMessage } from "../../util/embeds";
import translate from "../../functions/translate";

import Message from "../../models/Message";

const command: ContextCommand = {
    name: "Translate",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: new Roles(["mod"]),
    cooldown: 3,
    enabled: true,
    staffOnly: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const message = interaction.targetMessage;

            const data = await Message.findOne({ messages: message.url });

            if(!await Message.exists({ messages: message.url })) return await interaction.editReply({ embeds: [noMessage] });

            if(!data.content) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That message has no content!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const translation = await translate(data.content, "auto", "en");

            if(!translation.status || translation.translated === message.content) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That message could not be translated.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const time = await convertTime(translation.time);

            const result = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🌐 Translated Message")
                .setDescription(`\`\`\`${translation.translated}\`\`\``)
                .setFooter({ text: `Translated in ${time}.` })
                .setTimestamp()

            const original = new Discord.EmbedBuilder()
                .setTitle("Original Message")
                .setURL(message.url)
                .setDescription(data.content)
                .setTimestamp(new Date(Number((BigInt(data._id) >> 22n) + 1420070400000n)))

            let user = null;

            try {
                user = await client.users.fetch(data.user);
            } catch {}

            if(user) original.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });

            await interaction.editReply({ embeds: [result, original] });
        } catch(err) {
            client.logContextError(err, interaction, Discord);
        }
    }
}

async function convertTime(milliseconds: number): Promise<string> {
    if(milliseconds < 0) throw new Error("Input cannot be negative.");

    const seconds = milliseconds / 1000;

    if(seconds >= 1) {
        return seconds.toFixed(1) + "s";
    } else {
        return (seconds * 1000).toFixed(0) + "ms";
    }
}

export = command;
