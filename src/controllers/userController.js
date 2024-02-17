import fs from "fs";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";

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
        });
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
    user = await User.findOne({ email: email });
    if (!user) {
      user = await User.findOne({ username: username });
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
    console.log(user);
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

async function signUp(req, res) {
  let { firstName, lastName, username, password, email } = req.body;
  console.log(req.body);
  let image;
  if (!req.file) {
    req.file = { filename: "user.png" };
    image = req.file.filename;
  } else {
    image = req.file.filename;
  }

  try {
    console.log(req.body);
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
    const data = await User.findOne({ _id: req.query.id });
    if (data) {
      return res.json(data);
    }
    return res
      .status(404)
      .json({ error: `User with the id ${req.query.id} is not found!` });
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
  const { userId } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (user && targetUser) {
      user.updateOne({}, { $push: { friends: targetUser._id } });
      await user.save();
      return res.json(user);
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

export { getUsers, signUp, updateUser, deleteUser, getOneUser };
