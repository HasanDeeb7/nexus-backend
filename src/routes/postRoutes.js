import { Router } from "express";
import {
  addComment,
  addReaction,
  createPost,
  deleteComment,
  deletePost,
  getComments,
  getOnePost,
  getPosts,
  getPostsByType,
  getPostsByUser,
  getPostsFyp,
  likeComment,
  removeReaction,
} from "../controllers/postController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/multer.js";
import { paginate } from "../middlewares/pagination.js";

export const postRouter = Router();

postRouter.post("/create", upload.single("image"), authenticate, createPost);
postRouter.get("/", authenticate, paginate, getPosts);
postRouter.get("/one", authenticate, getOnePost);
postRouter.get("/byUser", paginate, getPostsByUser); // For user page
postRouter.get("/byGames", authenticate, paginate, getPostsFyp); // for you page, posts that's about a game in the user's interests
postRouter.get("/byType", authenticate, paginate, getPostsByType); //filter by type and game
postRouter.delete("/delete", authenticate, deletePost);
postRouter.patch("/comment", authenticate, addComment);
postRouter.patch("/react", authenticate, addReaction);
postRouter.patch("/remove-reaction", authenticate, removeReaction);
postRouter.patch("/like-comment", authenticate, likeComment);
postRouter.delete("/delete-comment", authenticate, deleteComment);
postRouter.get("/get-comments", authenticate, getComments);
