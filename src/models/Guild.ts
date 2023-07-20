import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    webhook: String,
    blockedUsers: Array
})

export default mongoose.model("guilds", schema, "guilds")