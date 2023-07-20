import ExtendedClient from "../../classes/ExtendedClient";
import { ButtonInteraction } from "discord.js";

import fetch from "node-fetch";

export = {
    name: "sentry-delete",
    startsWith: true,
    requiredRoles: ["dev"],
    async execute(interaction: ButtonInteraction & any, client: ExtendedClient, Discord: any) {
        const id = interaction.customId.replace("sentry-delete-", "");

        try {
            await fetch(`https://sentry.io/api/0/issues/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${process.env.sentry_bearer}`
                }
            })
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
            return;
        }

        const deleted = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.red)
            .setAuthor({ name: interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${interaction.user.id}` })
            .setTitle("🗑️ Deleted")
            .setTimestamp()

        interaction.message.components[0].components[0].data.disabled = true;
        interaction.message.components[0].components[1].data.disabled = true;
        interaction.message.components[0].components[2].data.disabled = true;

        interaction.message.embeds.push(deleted);

        await interaction.deferUpdate();

        await interaction.message.edit({ embeds: interaction.message.embeds, components: interaction.message.components });
    }
}
