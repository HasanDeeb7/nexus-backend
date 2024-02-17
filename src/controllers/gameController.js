import Game from "../models/gameModel.js";
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
    const game = await Game.create({ name: name, genres: genres });
    res.json(game);
  } catch (error) {
    console.log(error);
  }
}
export async function updateGame(req, res) {
  const { genres, name, _id } = req.body;
  const image = req.file.pathname;

  try {
    const game = await Game.findById(_id);
    if (game) {
      game.updateOne({
        name: name || game.name,
        genres: genres || game.genres,
        image: image || game.image,
      });
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
    const games = await Game.find();
    if (games) {
      return res.json(games);
    }
    return res.status(404).json({ error: "Not found!" });
  } catch (error) {
    console.log(error);
  }
}
