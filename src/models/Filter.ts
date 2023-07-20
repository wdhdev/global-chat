import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    words: Array
})

export default mongoose.model("filter", schema, "filter")