import { Router } from "express";
import {
  addFriend,
  addGames,
  deleteUser,
  getFriends,
  getOneUser,
  getUsers,
  signIn,
  signUp,
  updateUser,
  uploadAvatar,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/byusername", getOneUser);
userRouter.post("/signup", signUp);
userRouter.post("/login", signIn);
userRouter.delete("/delete", deleteUser);
userRouter.patch("/update", updateUser);
userRouter.get("/friends", authenticate, getFriends);
userRouter.post("/add-friend", authenticate, addFriend);
userRouter.patch(
  "/upload-avatar",
  upload.single("image"),
  authenticate,
  uploadAvatar
);
userRouter.patch("/add-games", authenticate, addGames);
