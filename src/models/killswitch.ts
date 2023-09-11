import { model, Schema } from "mongoose";

const schema = new Schema({
    killswitch: Boolean,
    killswitchMessage: String
})

export default model("killswitch", schema, "killswitch");
