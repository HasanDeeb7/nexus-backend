import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  text: { type: String },
  sender: { type: Schema.Types.ObjectId, ref: "Users" },
  room: { type: Schema.Types.ObjectId, ref: "Rooms" },
});

const Message = model("Messages", messageSchema);

export default Message;
