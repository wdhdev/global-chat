const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    immune: Boolean,
    dev: Boolean,
    mod: Boolean,
    verified: Boolean,
    donator: Boolean
})

module.exports = mongoose.model("users", schema, "users")