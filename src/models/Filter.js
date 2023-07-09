const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    _id: String,
    words: Array
})

module.exports = mongoose.model("filter", schema, "filter")