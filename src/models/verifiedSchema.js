const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String
})

module.exports = mongoose.model("verified-users", schema, "verified-users")