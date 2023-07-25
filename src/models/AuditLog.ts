import mongoose from "mongoose";

import Log from "../classes/Log";

const schema = new mongoose.Schema({
    _id: String,
    logs: Array<Log>
})

export default mongoose.model("audit-logs", schema, "audit-logs");
