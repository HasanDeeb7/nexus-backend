import { Router } from "express";
import { getCode, verifyCode } from "../controllers/verificationController.js";
import { authenticate } from "../middlewares/authenticate.js";

export const verificationRouter = Router();

verificationRouter.get("/", authenticate, getCode);
verificationRouter.post("/verify", authenticate, verifyCode);
