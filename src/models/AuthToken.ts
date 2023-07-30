import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    user: String,
    service: String
})

export default model("auth-tokens", schema, "auth-tokens");
