import { Router } from "express";
import { markAsRead } from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/authenticate.js";

export const notificationRouter = Router();

notificationRouter.patch("/all-read", authenticate, markAsRead);
