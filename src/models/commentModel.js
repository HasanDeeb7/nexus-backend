import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  post: { type: Object },
});

const Comment = model("Comments", commentSchema);
export default Comment;
