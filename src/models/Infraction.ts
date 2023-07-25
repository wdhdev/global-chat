import mongoose from "mongoose";

import Infraction from "../classes/Infraction";
import Warning from "../classes/Warning";

const schema = new mongoose.Schema({
    _id: String,
    audit_log: Array<Infraction>,
    warnings: Array<Warning>
})

export default mongoose.model("infractions", schema, "infractions");
