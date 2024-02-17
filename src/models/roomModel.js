import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roomSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  messages: String,
});

const Room = model("Rooms", roomSchema);
export default Room;
