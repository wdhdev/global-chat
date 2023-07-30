import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    channel: String,
    registered: String,
    user: String
})

export default model("sentry", schema, "sentry");
