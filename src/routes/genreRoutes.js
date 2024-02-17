import { Router } from "express";
import { createGenre, getGenres } from "../controllers/genreController.js";

export const genreRouter = Router();

genreRouter.get("/", getGenres);
genreRouter.post("/create", createGenre);
