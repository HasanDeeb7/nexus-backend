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

dbconnect();
const app = express();
const PORT = process.env.PORT;
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN,
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

app.listen(PORT, () => {
  console.log(`Server is listeningon port ${PORT}`);
});
