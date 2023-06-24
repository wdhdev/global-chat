const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    added_by: String,
    priority: String,
    name: String,
    description: String
})

module.exports = mongoose.model("to-do-list", schema, "to-do-list")
