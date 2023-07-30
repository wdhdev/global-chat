import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    timestamp: String,
    added_by: String,
    priority: String,
    name: String,
    description: String
})

export default model("to-do-list", schema, "to-do-list");
