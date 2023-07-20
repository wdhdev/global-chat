import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    channel: String,
    registered: String,
    user: String
})

export default mongoose.model("sentry", schema, "sentry")