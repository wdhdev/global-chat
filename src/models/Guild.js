const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    webhook: String,
    blockedUsers: Array
})

module.exports = mongoose.model("guilds", schema, "guilds")