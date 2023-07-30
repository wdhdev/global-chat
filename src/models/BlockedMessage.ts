import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    user: String,
    guild: String,
    content: String,
    filter: String,
    reason: Array
})

export default model("blocked-messages", schema, "blocked-messages");
