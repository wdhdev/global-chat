import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    filter: String,
    reason: Array
})

export default mongoose.model("blocked-messages", schema, "blocked-messages");
