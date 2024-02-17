import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = Schema({
  avatar: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  platform: [new Schema({ name: String, username: String })],
  code: { type: Schema.Types.ObjectId, ref: "Verifications" },
  games: [{ type: Schema.Types.ObjectId, ref: "Games" }],
  posts: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
  rooms: [{ type: Schema.Types.ObjectId, ref: "Rooms" }],
});

const User = model("Users", userSchema);
export default User;
