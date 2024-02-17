import mongoose from "mongoose";

const { Schema, model } = mongoose;
const verificationTokenSchema = new Schema({
  email: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "10m" },
  
}, {expires: 600});
const Verification = model("Verifications", verificationTokenSchema);
export default Verification;
