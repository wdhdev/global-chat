import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    channel: String,
    webhook: String,
    blockedUsers: Array
})

export default model("guilds", schema, "guilds");
