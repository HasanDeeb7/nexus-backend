import { Router } from "express";
import { createPlatform, getPlatforms } from "../controllers/platformController.js";

export const platformRouter = Router();

platformRouter.get("/", getPlatforms);
platformRouter.post("/create", createPlatform);