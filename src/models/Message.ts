import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    attachment: String,
    messages: Array
})

export default model("messages", schema, "messages");
