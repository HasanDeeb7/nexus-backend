import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema({
  type: {
    type: String,
    enum: ["News", "Meme", "Game Shot", "Thread"],
    default: "General",
  },
  game: { type: Schema.Types.ObjectId, ref: "Games" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  reactions: [
    new Schema({
      type: { type: String, enum: ["Like", "Dislike", "Love", "Funny", "Sad"] },
      user: { type: Object },
    }),
  ],
  caption: { type: String },
  image: String,
  user: { type: Schema.Types.ObjectId, ref: "Users" },
});

const Post = model("Posts", postSchema);
export default Post;
