const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    webhook: String
})

module.exports = mongoose.model("channels", schema, "channels")