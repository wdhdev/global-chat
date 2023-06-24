const emoji = require("../config.json").emojis;

const devSchema = require("../models/devSchema");
const filterSchema = require("../models/filterSchema");
const modSchema = require("../models/modSchema");

module.exports = {
	name: "filter",
	description: "Manage the bot's filter.",
    options: [
        {
            type: 1,
            name: "add",
            description: "Add a word to a filter.",
            options: [
                {
                    type: 3,
                    name: "word",
                    description: "The word you want to add to a filter.",
                    min_length: 3,
                    max_length: 64,
                    required: true
                } // ,

                // {
                //     type: 3,
                //     name: "filter",
                //     description: "The filter you want to add the word to.",
                //     choices: [
                //         {
                //             name: "block",
                //             description: "Add the word to the blocked words filter.",
                //             value: "block"
                //         },

                //         {
                //             name: "unblock",
                //             description: "Add the word to the unblocked words filter.",
                //             value: "unblock"
                //         }
                //     ],
                //     required: true
                // }
            ]
        },

        {
            type: 1,
            name: "list",
            description: "Get a list of all the words in a filter.",
            options: [
                // {
                //     type: 3,
                //     name: "filter",
                //     description: "The filter you want the list of.",
                //     choices: [
                //         {
                //             name: "block",
                //             description: "Get a list of the blocked words filter.",
                //             value: "block"
                //         },

                //         {
                //             name: "unblock",
                //             description: "Get a list of the blocked words filter.",
                //             value: "unblock"
                //         }
                //     ],
                //     required: true
                // }
            ]
        },

        {
            type: 1,
            name: "remove",
            description: "Remove a word from a filter.",
            options: [
                {
                    type: 3,
                    name: "word",
                    description: "The word you want to remove from a filter.",
                    min_length: 3,
                    max_length: 64,
                    required: true
                } // ,

                // {
                //     type: 3,
                //     name: "filter",
                //     description: "The filter you want to remove the word from.",
                //     choices: [
                //         {
                //             name: "block",
                //             description: "Remove the word from the blocked words filter.",
                //             value: "block"
                //         },

                //         {
                //             name: "unblock",
                //             description: "Remove the word to from unblocked words filter.",
                //             value: "unblock"
                //         }
                //     ],
                //     required: true
                // }
            ]
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 0,
    enabled: true,
    hidden: true,
	async execute(interaction, client, Discord) {
        try {
            const dev = await devSchema.exists({ _id: interaction.user.id });
            const mod = await modSchema.exists({ _id: interaction.user.id });

            if(!mod && !dev) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.error} You do not have permission to run this command!`)

                await interaction.editReply({ embeds: [error], ephemeral: true });
                return;
            }

            if(interaction.options.getSubcommand() === "add") {
                const word = interaction.options.getString("word");
                // const filter = interaction.options.getString("filter");
                const filter = "block";

                filterSchema.findOne({ _id: filter }, async (err, data) => {
                    if(data) {
                        if(data.words.includes(word.toLowerCase())) {
                            const error = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.error} That word is already on the filter!`)

                            await interaction.editReply({ embeds: [error], ephemeral: true });
                            return;
                        }

                        data.words.push(word.toLowerCase());

                        await data.save();

                        const added = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} That word has been added to the filter!`)

                        await interaction.editReply({ embeds: [added] });
                        return;
                    }

                    if(!data) {
                        new filterSchema({
                            _id: filter,
                            words: [word.toLowerCase()]
                        }).save()

                        const added = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} That word has been added to the filter!`)

                        await interaction.editReply({ embeds: [added] });
                        return;
                    }
                })

                return;
            }

            // if(interaction.options.getSubcommand() === "list") {
            //     // const filter = interaction.options.getString("filter");
            //     const filter = "block";

            //     const data = await filterSchema.findOne({ _id: filter });

            //     if(!data) {
            //         const error = new Discord.EmbedBuilder()
            //             .setColor(client.config_embeds.error)
            //             .setDescription(`${emoji.error} There are no words on the filter!`)

            //         await interaction.editReply({ embeds: [error], ephemeral: true });
            //         return;
            //     }

            //     const filters = {
            //         "block": "Block",
            //         // "unblock": "Unblock"
            //     }

            //     const embed = new Discord.EmbedBuilder()
            //         .setColor(client.config_embeds.default)
            //         .setTitle(`${filters[filter]} Filter`)
            //         .setDescription(`\`${data.words.sort().join("\`, \`")}\``)

            //     try {
            //         await interaction.user.send({ embeds: [embed] });
            //     } catch {
            //         const error = new Discord.EmbedBuilder()
            //             .setColor(client.config_embeds.error)
            //             .setDescription(`${emoji.error} I could not DM you!`)

            //         await interaction.editReply({ embeds: [error], ephemeral: true });
            //         return;
            //     }

            //     const sent = new Discord.EmbedBuilder()
            //         .setColor(client.config_embeds.default)
            //         .setDescription(`${emoji.successful} Check your DMs!`)

            //     await interaction.editReply({ embeds: [sent] });
            //     return;
            // }

            if(interaction.options.getSubcommand() === "remove") {
                const word = interaction.options.getString("word");
                // const filter = interaction.options.getString("filter");
                const filter = "block";

                filterSchema.findOne({ _id: filter }, async (err, data) => {
                    if(data) {
                        if(!data.words.includes(word.toLowerCase())) {
                            const error = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.error} That word is not on the filter!`)

                            await interaction.editReply({ embeds: [error], ephemeral: true });
                            return;
                        }

                        data.words = data.words.filter(item => item !== word.toLowerCase());

                        await data.save();

                        const removed = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} That word has been removed from the filter!`)

                        await interaction.editReply({ embeds: [removed] });
                        return;
                    }

                    if(!data) {
                        const none = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.successful} There are no words on the filter!`)

                        await interaction.editReply({ embeds: [none] });
                        return;
                    }
                })

                return;
            }
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}