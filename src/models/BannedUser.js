const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    allowAppeal: Boolean,
    reason: String,
    mod: String
})

module.exports = mongoose.model("banned-users", schema, "banned-users")