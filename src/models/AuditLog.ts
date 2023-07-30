import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    logs: Array
})

export default model("audit-logs", schema, "audit-logs");
