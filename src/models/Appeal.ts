import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    id: String,
    ban_reason: String,
    unban_reason: String,
    status: String,
    mod: String,
    reason: String
})

export default model("appeals", schema, "appeals");
