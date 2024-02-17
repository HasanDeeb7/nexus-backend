import mongoose from "mongoose";

const { Schema, model } = mongoose;

const gameSchema = new Schema({
  name: { type: String },
  image: { type: String },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genres" }],
  users: { type: Schema.Types.ObjectId, ref: "User" },
  posts: { type: Schema.Types.ObjectId, ref: "Posts" },
});

const Game = model("Games", gameSchema);
export default Game;
