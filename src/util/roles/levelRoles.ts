import ExtendedClient from "../../classes/ExtendedClient";
import { User as UserType } from "discord.js";

import Message from "../../models/Message";
import User from "../../models/User";

export default async function (user: UserType, client: ExtendedClient & any, Discord: any) {
    const messages = (await Message.find({ user: user.id })).length;
    const userData = await User.findOne({ _id: user.id });

    if(userData?.verified) return;

    // 1,000+ Messages
    if(messages >= 1000) {
        const logsChannel = client.channels.cache.get(client.config_channels.logs);

        if(!userData) {
            new User({ _id: user.id, verified: true }).save();
        } else {
            await User.findOneAndUpdate({ _id: user.id }, { verified: true });
        }

        const guild = await client.guilds.fetch(client.config_default.ownerGuild);

        const member = guild.members.cache.get(user.id);
        const role = guild.roles.cache.get(client.config_roles.verified);

        if(member) member.roles.add(role);

        const verified = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setTitle("🥳 Congratulations")
            .setDescription("You have sent more than 1,000 messages in Global Chat!")
            .addFields (
                { name: "🎭 Role Received", value: "✅ Verified" },
                { name: "🔓 Features Unlocked", value: "- 🖼️ Sending Images\n- 🔗 Sending Links" }
            )
            .setTimestamp()

        try {
            await user.send({ embeds: [verified] });
        } catch {}

        const log = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.default)
            .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
            .setTitle("Role Added")
            .addFields (
                { name: "🎭 Role", value: "✅ Verified" },
                { name: "👤 User", value: `${user}` }
            )
            .setTimestamp()

        logsChannel.send({ embeds: [log] });
    }
}
