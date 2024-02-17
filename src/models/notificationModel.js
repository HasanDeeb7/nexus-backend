import mongoose from "mongoose";

const { Schema, model } = mongoose;
const notificationSchema = new Schema({
  message: String,
  sender: { type: Schema.Types.ObjectId, ref: "Users" },
  receiver: { type: Schema.Types.ObjectId, ref: "Users" },
});

const Notification = model("Notifications", notificationSchema);
export default Notification;
