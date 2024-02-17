import { Router } from "express";
import {
  addComment,
  addReaction,
  createPost,
  deletePost,
  getOnePost,
  getPosts,
  getPostsByType,
  getPostsByUser,
  getPostsFyp,
  removeReaction,
} from "../controllers/postController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";
import { paginate } from "../middlewares/pagination.js";

export const postRouter = Router();

postRouter.post("/create", upload.single("image"), authenticate, createPost);
postRouter.get("/", paginate, authenticate, getPosts);
postRouter.get("/one", authenticate, getOnePost);
postRouter.get("/byUser", paginate, getPostsByUser); // For user page
postRouter.get("/byGame", authenticate, paginate, getPostsFyp); // for you page, posts that's about a game in the user's interests
postRouter.get("/byType", authenticate, paginate, getPostsByType); //filter by type and game
postRouter.delete("/delete", authenticate, deletePost);
postRouter.patch("/comment", authenticate, addComment);
postRouter.patch("/react", authenticate, addReaction);
postRouter.patch("/remove-reaction", authenticate, removeReaction);
