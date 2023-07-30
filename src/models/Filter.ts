import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    words: Array
})

export default model("filter", schema, "filter");
