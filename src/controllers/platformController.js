import Platform from "../models/platformModel.js";

export async function getPlatforms(req, res) {
  const platforms = await Platform.find();
  if (platforms) {
    res.json(platforms);
  } else {
    res.status(404).send("Error getting platfomrs");
  }
}
export async function createPlatform(req, res) {
  const { name } = req.body;
  const newPlatform = await Platform.create({ name });
  if (newPlatform) {
    res.json(newPlatform);
  } else {
    res.status(400).send("error");
  }
}
