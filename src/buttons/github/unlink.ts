import Button from "../../classes/Button";
import ExtendedClient from "../../classes/ExtendedClient";
import Roles from "../../classes/Roles";
import { ButtonInteraction } from "discord.js";

import { Octokit } from "@octokit/core";
import { emojis as emoji } from "../../config";

import GitHubUser from "../../models/GitHubUser";

const button: Button = {
    name: "github-unlink",
    startsWith: false,
    requiredRoles: new Roles([]),
    async execute(interaction: ButtonInteraction, client: ExtendedClient, Discord: any) {
        try {
            const data = await GitHubUser.findOne({ _id: interaction.user.id });

            if(!data) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You have not linked your GitHub account!`)

                await interaction.reply({ embeds: [error], ephemeral: true });
                return;
            }

            try {
                const octokit = new Octokit({ auth: data.token });

                await octokit.request("DELETE /applications/{client_id}/grant", {
                    client_id: process.env.github_client_id,
                    access_token: data.token
                })
            } catch {}

            await data.delete();

            const unlinked = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.github)
                .setDescription(`${emoji.tick} Your GitHub account has been unlinked.`)

            await interaction.reply({ embeds: [unlinked], ephemeral: true });
        } catch(err) {
            client.logButtonError(err, interaction, Discord);
        }
    }
}

export = button;
