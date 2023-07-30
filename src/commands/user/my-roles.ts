import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import { getRoleArray, Role, getRoleWithEmoji } from "../../classes/Roles";
import getRoles from "../../functions/roles/get";

const command: Command = {
    name: "my-roles",
    description: "Get your Global Chat roles.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    requiredRoles: [],
    cooldown: 10,
    enabled: true,
    allowWhileBanned: false,
    guildOnly: false,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: any) {
        try {
            const roleArray: Role[] = getRoleArray(await getRoles(interaction.user.id, client));
            const roles = roleArray.map(role => getRoleWithEmoji(role));

            const rolesEmbed = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("🎭 Roles")
                .setDescription(roles.join("\n") || "*You have no roles.*")

            await interaction.editReply({ embeds: [rolesEmbed] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
