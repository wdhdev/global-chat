import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    id: Number,
    avatar_url: String,
    username: String,
    email: String,
    token: String,
    linked: String,
    lastUpdated: String
})

export default model("github-users", schema, "github-users");
