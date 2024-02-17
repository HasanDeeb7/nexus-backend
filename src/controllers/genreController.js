import Genre from "../models/genreModel.js";

export async function createGenre(req, res) {
  try {
    const { name } = req.body;
    const genre = await Genre.create({ name, name });
    res.json(genre);
  } catch (error) {
    console.log(error);
  }
}
export async function getGenres(req, res) {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    console.log(error);
  }
}
