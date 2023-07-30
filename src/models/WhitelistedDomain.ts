import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    timestamp: String,
    whitelisted_by: String
})

export default model("whitelisted-domains", schema, "whitelisted-domains");
