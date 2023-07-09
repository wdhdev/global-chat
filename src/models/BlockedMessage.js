const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    filter: String,
    reason: Array
})

module.exports = mongoose.model("blocked-messages", schema, "blocked-messages")