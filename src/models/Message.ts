import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    attachment: String,
    messages: Array
})

export default mongoose.model("messages", schema, "messages");
