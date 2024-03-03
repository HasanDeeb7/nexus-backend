import { randomInt } from "crypto";
import User from "../models/userModel.js";
import Verification from "../models/verificationToken.js";
import { sendVerificationCode } from "../middlewares/mail.js";
export async function getCode(req, res) {
  try {
    const userId = req.user.id;
    const code = randomInt(100000, 999999).toString();
    const user = await User.findById(userId);
    const verification = await Verification.create({
      verificationCode: code,
      email: user.email,
    });
    user.code = verification._id;
    await sendVerificationCode(user.email, code);
    await user.save();
    res.json({ code: code });
  } catch (error) {
    console.log(error);
  }
}

export async function verifyCode(req, res) {
  const { code } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId).populate("code").exec();
  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }
  if (user.code?.verificationCode === code) {
    user.isVerified = true;
    res.json({ message: "Code matches" });
    await Verification.findOneAndDelete({ verificationCode: code });
    user.code = undefined;
    await user.save();
  } else {
    res.status(400).json({ message: "Wrong code, or expired" });
  }
  try {
  } catch (error) {
    console.log(error);
  }
}
