import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    allowAppeal: Boolean,
    reason: String,
    mod: String
})

export default mongoose.model("banned-users", schema, "banned-users")