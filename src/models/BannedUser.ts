import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    timestamp: String,
    allowAppeal: Boolean,
    reason: String,
    mod: String
})

export default model("banned-users", schema, "banned-users");
