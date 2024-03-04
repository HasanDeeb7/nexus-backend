import Room from "../models/roomModel.js";
import User from "../models/userModel.js";

export async function getRoom(req, res) {
  const { targetUser } = req.query;
  const user = await User.findOne({ username: targetUser });
  console.log(targetUser);
  if (user) {
    const existingRoom1 = await Room.findOne({
      users: { $all: [req.user.id, user._id] },
    }).populate([
      "messages",
      { path: "messages", populate: ["sender", "receiver"] },
    ]);
    if (!existingRoom1) {
      const existingRoom2 = await Room.findOne({
        users: { $all: [user._id, req.user.id] },
      }).populate([
        "messages",
        { path: "messages", populate: ["sender", "receiver"] },
      ]);
      if (!existingRoom2) {
        return res.status(404).json({ message: "Room Not Found!" });
      }
      return res.json(existingRoom2);
    }
    return res.json(existingRoom1);
  } else {
    return res.status(404).json({ message: "User Not Found!" });
  }
}
