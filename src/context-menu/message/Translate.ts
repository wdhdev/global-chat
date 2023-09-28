import ContextCommand from "../../classes/ContextCommand";
import ExtendedClient from "../../classes/ExtendedClient";
import { MessageContextMenuCommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";
import translate from "../../functions/translate";

const command: ContextCommand = {
    name: "Translate",
    type: 3,
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 5,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const message = interaction.targetMessage;

            if(!message.content) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That message has no content!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const result = await translate(message.content, "auto", "en");

            if(!result.status) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That message could not be translated.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            if(result.translated.toLowerCase() === message.content.toLowerCase()) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} That message has no content that needs to be translated!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const time = await convertTime(result.time);

            const translated = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Translated Message")
                .setURL(message.url)
                .setDescription(`\`\`\`${result.translated}\`\`\``)
                .setFooter({ text: time })
                .setTimestamp()

            await interaction.editReply({ embeds: [translated] });
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
