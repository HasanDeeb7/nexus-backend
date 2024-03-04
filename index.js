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
import { Server } from "socket.io";
import { createServer } from "http";
import { sendNotification } from "./src/utils/notifications.js";
import { notificationRouter } from "./src/routes/notificationRoutes.js";
import { roomRouter } from "./src/routes/roomRoutes.js";
import { saveMessage } from "./src/utils/chat.js";
import { Server as socketServer } from "socket.io";

dbconnect();
const app = express();

const PORT = process.env.PORT;
app.use(
  cors({
    origin: [
      "https://nexus-frontend-three.vercel.app",
      process.env.FRONTEND_ORIGIN,
      "http://localhost:5173",
      "*",
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
app.use("/notification", notificationRouter);
app.use("/room", roomRouter);
app.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const posts = await Post.find({
      $or: [
        { caption: { $regex: query, $options: "i" } }, // Search in posts where type is 'game' and caption includes the query
      ],
    }).populate("user");

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

const httpServer = createServer(app);
// const io = new Server(httpServer);
const io = new socketServer(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log("joined-room : " + room);
  });

  socket.on("friend-add", async ({ user, targetUser }) => {
    console.log("Emitting friend-add-receive event to room: " + targetUser);
    const notification = await sendNotification(
      `${user.username} just added you as a teammate`,
      user._id,
      targetUser
    );
    if (notification) {
      io.to(targetUser).emit("friend-add-receive", {
        message: notification.message,
        user: notification.user,
        sender: user.username,
      });
      console.log(
        "Successfully emitted friend-add-receive event to room: " + targetUser
      );
    }
  });
  socket.on("broadcast-message", ({ username, message }) => {
    socket.broadcast.emit("receive-broadcast-message", { username, message });
  });
  socket.on(
    "send-message",
    async ({ sender, receiver, message, createdAt }) => {
      console.log(sender.username, receiver, message);
      const savedMessage = await saveMessage(sender, receiver);
      if (savedMessage.room) {
        socket.to(receiver).emit("receive-message", {
          message: message,
          sender: sender,
          room: savedMessage.room._id,
          createdAt: createdAt,
        });
        socket.to(receiver).emit("new-message-notification", {
          user: sender,
          message: message,
        });
      }
    }
  );
});

// httpServer.listen(3001);

httpServer.listen(PORT, () => {
  console.log(`Server is listeningon port ${PORT}`);
});
