import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    immune: Boolean,
    dev: Boolean,
    mod: Boolean,
    verified: Boolean,
    donator: Boolean
})

export default model("users", schema, "users");
