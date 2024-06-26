import { EmbedBuilder } from "discord.js";
import { embeds, emojis as emoji } from "../config";

const cannotBanBots = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot ban bots!`)

const cannotBanUser = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot ban that user!`)

const cannotBanYourself = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot ban yourself!`)

const cannotWarnBots = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot warn bots!`)

const cannotWarnUser = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot warn that user!`)

const cannotWarnYourself = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You cannot warn yourself!`)

const noMessage = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} No message was found with that ID!`)

const noPermissionButton = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You do not have permission to run this button!`)

const noPermissionCommand = new EmbedBuilder()
    .setColor(embeds.error)
    .setDescription(`${emoji.cross} You do not have permission to run this command!`)

export {
    cannotBanBots,
    cannotBanUser,
    cannotBanYourself,
    cannotWarnBots,
    cannotWarnUser,
    cannotWarnYourself,
    noMessage,
    noPermissionButton,
    noPermissionCommand
}
