import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: String,
    timestamp: String,
    whitelisted_by: String
})

export default mongoose.model("whitelisted-domains", schema, "whitelisted-domains");
