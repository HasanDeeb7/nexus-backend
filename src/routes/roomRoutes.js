import { Router } from "express";
import { getRoom } from "../controllers/roomController.js";
import { authenticate } from "../middlewares/authenticate.js";

export const roomRouter = Router();

roomRouter.get("/", authenticate, getRoom);
