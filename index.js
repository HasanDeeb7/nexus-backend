import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbconnect from "./src/config/db.js";
import { userRouter } from "./src/routes/userRoutes.js";
import { gameRouter } from "./src/routes/gameRoutes.js";
import { genreRouter } from "./src/routes/genreRoutes.js";
import { verificationRouter } from "./src/routes/verificationCodeRoutes.js";
import { postRouter } from "./src/routes/postRoutes.js";
import Platform from "./src/models/platformModel.js";
import { platformRouter } from "./src/routes/platformsRoutes.js";
import Post from "./src/models/postModel.js";
import User from "./src/models/userModel.js";
import Game from "./src/models/gameModel.js";
dbconnect();
const app = express();
const PORT = process.env.PORT;
app.use(
  cors({
    origin: [
      "https://nexus-frontend-three.vercel.app",
      process.env.FRONTEND_ORIGIN,
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public/images"));

app.use("/user", userRouter);
app.use("/game", gameRouter);
app.use("/genre", genreRouter);
app.use("/code", verificationRouter);
app.use("/post", postRouter);
app.use("/platform", platformRouter);
app.get("/search", async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    const posts = await Post.find({
      $or: [
        { caption: { $regex: query, $options: "i" } }, // Search in posts where type is 'game' and caption includes the query
      ],
    });

    // Search in users
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } }, // Search in users where username includes the query
      ],
    });
    const postByGames = await Game.find({
      $or: [{ name: { $regex: query, $options: "i" } }],
    }).populate("posts");
    if (users || posts || postByGames) {
      res.json({ users, posts, postByGames: postByGames });
    } else {
      res.status(404).send(`No results found for "${query}"`);
    }
  } catch (error) {
    console.log(error);
  }
});
app.listen(PORT, () => {
  console.log(`Server is listeningon port ${PORT}`);
});
