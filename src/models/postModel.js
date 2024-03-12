import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    isSpoiler: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["News", "Meme", "Game Shot", "Help", "General"],
      default: "General",
    },
    game: { type: Schema.Types.ObjectId, ref: "Games" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
    reactions: [
      new Schema({
        type: { type: String, enum: ["Like", "Respect"] },
        user: { type: String },
      }),
    ],
    caption: { type: String },
    image: String,
    user: { type: Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

const Post = model("Posts", postSchema);
export default Post;
