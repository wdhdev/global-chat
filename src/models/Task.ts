import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    added_by: String,
    priority: String,
    name: String,
    description: String
})

export default mongoose.model("to-do-list", schema, "to-do-list");
