import fs from "fs";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import Platform from "../models/platformModel.js";
import { createRoom } from "../utils/chat.js";
import Game from "../models/gameModel.js";

function removeImage(image) {
  fs.unlinkSync(`public/images/${image}`, (err) => {
    if (err) {
      console.log(`we can't delete the image`);
    } else {
      console.log("image deleted");
    }
  });
}

export const signIn = async (req, res) => {
  try {
    const token = req.cookies?.access_token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded) {
        const user = await User.findOne({
          _id: decoded.id,
        }).populate([
          "games",
          "friends",
          "posts",
          "notifications",
          { path: "notifications", populate: ["sender", "receiver"] },
        ]);
        if (user) {
          return res.json(user);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
  const { email, password, username } = req.body;
  if ([username, password].some((item) => item === "")) {
    return res.status(400).json({ error: "All Fields are Required!" });
  }
  let user;
  try {
    user = await User.findOne({ email: username }).populate([
      "games",
      "friends",
      "posts",
      "notifications",
    ]);
    if (!user) {
      user = await User.findOne({ username: username }).populate([
        "games",
        "friends",
        "posts",
        "notifications",
      ]);
      if (!user) {
        return res.status(404).json({ error: "User doesn't exist!" });
      }
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(500).json({ error: "Wrong Password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        lastName: user.lastName,
        firstName: user.firstName,
      },
      process.env.JWT_SECRET
    );
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res
      .cookie("access_token", token, {
        secure: true,
        httpOnly: true,
        sameSite: "None",
      })
      .status(200)
      .json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Sign In" });
  }
};

export async function logout(req, res) {
res.clearCookie("access_token", { httpOnly: true, path: "/", maxAge: -1 }).send("Logged out");
}

async function signUp(req, res) {
  let { firstName, lastName, username, password, email } = req.body;
  let image;
  if (!req.file) {
    req.file = { filename: "user.png" };
    image = req.file.filename;
  } else {
    image = req.file.filename;
  }

  try {
    if (!firstName || !lastName || !username || !password || !email) {
      return res.status(400).json({ message: "missing required property" });
    } else {
      let passExpression = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      let userNameExpression = /^[A-Z](?=.*\d)[a-zA-Z0-9]{5,13}$/;
      if (!password.match(passExpression)) {
        return res.status(400).json({
          error:
            "password should start with letter and has 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter",
        });
      }
      if (!username.match(userNameExpression)) {
        return res.status(400).json({
          error:
            "Invalid username. Please ensure it starts with a letter, is between 6 and 14 characters, and contains at least one numeric digit.",
        });
      } else {
        let findUser = await User.findOne({
          username: username,
        });
        if (findUser) {
          return res.status(400).json({ error: "Username already exist" });
        }
        findUser = await User.findOne({ email: email.toLowerCase() });
        if (findUser) {
          return res
            .status(400)
            .json({ error: "a User with this email already exist" });
        }
        try {
          const hashedPass = await bcrypt.hash(password, 10);
          const newUser = await User.create({
            ...req.body,
            password: hashedPass,
            email: email.toLowerCase(),
          });
          if (newUser) {
            const token = jwt.sign(
              {
                id: newUser._id,
                isAdmin: newUser.isAdmin,
                lastName: newUser.lastName,
                firstName: newUser.firstName,
              },
              process.env.JWT_SECRET
            );
            res
              .cookie("access_token", token, {
                secure: true,
                httpOnly: true,
                sameSite: "None",
              })
              .json(newUser);
          } else {
            res.status(500).json({ error: "Error creating a user" });
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

async function updateUser(req, res) {
  const user = req.body;

  try {
    const found = await User.findOne({ _id: user.id });
    if (!found) {
      return res.status(400).json({ error: "User not found" });
    }
    if (user.userName) {
      return res.status(400).json({ error: "you can't update your username" });
    }

    if (user.password) {
      const hashedPass = await bcrypt.hash(user.password, 10);
      user.password = hashedPass;
    }
    req.body.security
      ? await User.findOneAndUpdate(
          { _id: user.id },
          { ...user, passwordUpdatedAt: Date.now() }
        )
      : await User.findOneAndUpdate({ _id: user.id }, { ...user });

    return res.status(200).json({ message: "Updated Successfully" });
  } catch (err) {
    console.error("could not update user " + err);
    return res.status(500).json({ error: "server error" });
  }
}

async function deleteUser(req, res) {
  const { id } = req.query;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await User.findOneAndDelete({ _id: id });
    res.json({ message: "User has been deleted" });
  } catch (error) {
    console.log("Failed to delete record : ", error);
    res.status(400).json("not deleted");
  }
}

async function getOneUser(req, res) {
  try {
    const data = await User.findOne({ username: req.query.username }).populate([
      "posts",
      "games",
      "friends",
    ]);
    if (data) {
      return res.json(data);
    }
    return res
      .status(404)
      .json({ error: `User with the id ${req.query.username} is not found!` });
  } catch (error) {
    console.log(error);
  }
}
export async function getFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("friends");
    if (user) {
      return res.json({ friends: user.friends });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
  }
}
export async function addFriend(req, res) {
  const { username } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findOne({ username: username }).populate(
      "friends"
    );
    if (user && targetUser) {
      let updatedUser;
      if (user.friends.includes(targetUser._id)) {
        // If targetUser is already a friend, remove it
        updatedUser = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $pull: { friends: targetUser._id } },
          { new: true }
        ).populate("friends");

        return res.json({
          action: "remove",
          user: updatedUser,
          targetUser: targetUser,
        });
      } else {
        // If targetUser is not a friend, add it
        const room = await createRoom(user, targetUser);

        updatedUser = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $push: { friends: targetUser._id } },
          { new: true }
        ).populate("friends");

        if (room) {
          updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            { $addToSet: { rooms: room._id } }, // Using $addToSet to avoid duplicates
            { new: true }
          ).populate("friends");
          await targetUser.updateOne(
            {},
            { $addToSet: { rooms: room._id } }, // Using $addToSet to avoid duplicates
            { new: true }
          );
        }

        return res.json({
          action: "add",
          user: updatedUser,
          targetUser: targetUser,
        });
      }
    } else {
      return res.status(400).json({ error: "Error getting users data" });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function uploadAvatar(req, res) {
  const image = req.file?.filename;
  try {
    if (image) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: image },
        { new: true }
      );
      if (user) {
        res.json({ success: "Avatar updated successfully", user: user });
      } else {
        return res.status(404).json({ error: "Error getting user data" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addGames(req, res) {
  const { games } = req.body;
  try {
    const response = await User.findByIdAndUpdate(
      { _id: req.user.id },
      { games: games }
    );
    Promise.all(
      games.map(
        async (gameId) =>
          await Game.findByIdAndUpdate(gameId, {
            $addToSet: { users: req.user.id },
          })
      )
    );
    if (response) {
      res.json(response);
    } else {
      res.status(500).json({ error: "Error adding games" });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function withGoogle(req, res) {
  const { email, image, name } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          lastName: user.lastName,
          firstName: user.firstName,
        },
        process.env.JWT_SECRET
      );
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        })
        .status(200)
        .json(user);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const generatedName =
        req.body.name.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-4);

      const newUser = await User.create({
        username: generatedName,
        email: email,
        password: hashedPassword,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1],
        avatar: image,
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          role: newUser.role,
          lastName: newUser.lastName,
          firstName: newUser.firstName,
        },
        process.env.JWT_SECRET
      );
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(newUser);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addPlatform(req, res) {
  const { platformName, username } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        "platforms.name": platformName,
      },
      {
        $set: { "platforms.$.username": username },
      },
      { new: true }
    );
    if (!user) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: { platforms: { name: platformName, username: username } },
        },
        { new: true }
      );
      return res.json(updatedUser);
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}

export { getUsers, signUp, updateUser, deleteUser, getOneUser };
