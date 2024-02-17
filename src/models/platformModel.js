import mongoose from "mongoose";

const { Schema, model } = mongoose;
const platformSchema = new Schema({
  name: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

const Platform = model("Platforms", platformSchema);
export default Platform;
