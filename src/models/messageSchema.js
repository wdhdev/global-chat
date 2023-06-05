const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    attachment: String,
    messages: Array
})

module.exports = mongoose.model("messages", schema, "messages")