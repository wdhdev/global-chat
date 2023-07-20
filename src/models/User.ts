import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    immune: Boolean,
    dev: Boolean,
    mod: Boolean,
    verified: Boolean,
    donator: Boolean
})

export default mongoose.model("users", schema, "users")