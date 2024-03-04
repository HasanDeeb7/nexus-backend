import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    content: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "Users" },
    receiver: { type: Schema.Types.ObjectId, ref: "Users" },
    room: { type: Schema.Types.ObjectId, ref: "Rooms" },
  },
  { timestamps: true }
);

const Message = model("Messages", messageSchema);

export default Message;
