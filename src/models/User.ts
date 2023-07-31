import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    immune: Boolean,
    dev: Boolean,
    mod: Boolean,
    verified: Boolean,
    donator: Boolean,
    nick: String
})

export default model("users", schema, "users");

