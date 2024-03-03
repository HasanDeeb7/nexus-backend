import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export async function markAsRead(req, res) {
  const user = await User.findByIdAndUpdate(req.user.id, { notifications: [] });
  console.log(req.user.id);
  try {
    const notifications = await Notification.deleteMany({
      receiver: req.user.id,
    });
    if (notifications) {
      res.json({ message: "All notifications marked as read" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}
