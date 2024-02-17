import { Router } from "express";
import {
  createGame,
  getGames,
  updateGame,
} from "../controllers/gameController.js";
import { upload } from "../middlewares/multer.js";

export const gameRouter = Router();

gameRouter.get("/", getGames);
gameRouter.post("/create", upload.single("image"), createGame);
gameRouter.patch("/update", upload.single("image"), updateGame);
