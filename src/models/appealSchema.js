const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    id: String,
    ban_reason: String,
    unban_reason: String,
    status: String,
    mod: String,
    reason: String
})

module.exports = mongoose.model("appeals", schema, "appeals")