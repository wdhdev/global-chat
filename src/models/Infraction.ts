import { model, Schema } from "mongoose";

const schema = new Schema({
    _id: String,
    audit_log: Array,
    warnings: Array
})

export default model("infractions", schema, "infractions");
