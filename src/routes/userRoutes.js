import { Router } from "express";
import {
  addFriend,
  addGames,
  addPlatform,
  deleteUser,
  getFriends,
  getOneUser,
  getUsers,
  logout,
  signIn,
  signUp,
  updateUser,
  uploadAvatar,
  withGoogle,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";
import { authenticate } from "../middlewares/authenticate.js";

export const userRouter = Router();

userRouter.get("/logout", logout);
userRouter.get("/", getUsers);
userRouter.get("/by-username", getOneUser);
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
userRouter.patch("/add-platform", authenticate, addPlatform);
userRouter.post("/withGoogle", withGoogle);
