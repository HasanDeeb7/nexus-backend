import mongoose from "mongoose";

const { Schema, model } = mongoose;

const genreSchema = new Schema({
  name: String,
  games: [{ type: Schema.Types.ObjectId, ref: "Games" }],
});
const Genre = model("Genres", genreSchema);
export default Genre;
