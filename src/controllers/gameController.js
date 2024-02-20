import Game from "../models/gameModel.js";
import Genre from "../models/genreModel.js";
function removeImage(image) {
  fs.unlinkSync(`public/images/${image}`, (err) => {
    if (err) {
      console.log(`we can't delete the image`);
    } else {
      console.log("image deleted");
    }
  });
}

export async function createGame(req, res) {
  const { genres, name } = req.body;
  const image = req.file.pathname;

  try {
    const game = await Game.create({
      name: name,
      genres: genres,
      image: image,
      platforms: req.body.platforms || "",
    });
    Promise.all(
      genres.map(async (id) => {
        await Genre.updateOne({ _id: id }, { $addToSet: { games: game._id } });
      })
    );
    res.json(game);
  } catch (error) {
    console.log(error);
  }
}
export async function updateGame(req, res) {
  const { genres, name, _id } = req.body;
  const image = req.file.filename;
  console.log(req.file);

  try {
    const game = await Game.findById(_id);
    if (game) {
      await Game.updateOne(
        { _id: _id },
        {
          name: name || game.name,
          genres: genres || game.genres,
          image: image || game.image,
        }
      );
    } else {
      res.status(404).json({ error: "Game not found!" });
    }
    res.json(game);
  } catch (error) {
    console.log(error);
  }
}
export async function getGames(req, res) {
  try {
    const games = await Game.find().populate(["genres", "posts"]);
    if (games) {
      return res.json(games);
    }
    return res.status(404).json({ error: "Not found!" });
  } catch (error) {
    console.log(error);
  }
}

export async function getGamesByName(req, res) {
  const name = req.params.name;
  try {
    const games = await Game.find({
      name: { $regex: new RegExp(name, "i") },
    }).populate(["genres"]);
    if (games) {
      res.json(games);
    } else {
      res.status(404).json({ error: "No Games" });
    }
  } catch (error) {
    console.log(error);
  }
}
