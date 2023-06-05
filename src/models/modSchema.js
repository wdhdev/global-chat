const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String
})

module.exports = mongoose.model("moderators", schema, "moderators")