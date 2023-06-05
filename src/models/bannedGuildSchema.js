const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    reason: String,
    mod: String
})

module.exports = mongoose.model("banned-guilds", schema, "banned-guilds")