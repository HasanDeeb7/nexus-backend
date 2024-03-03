import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export async function sendNotification(message, sender, receiver) {
  try {
    const notification = await Notification.create({
      message: message,
      sender: sender,
      // receiver: receiver,
    });
    if (notification) {
      const user = await User.findOneAndUpdate(
        { username: receiver },
        { $push: { notifications: notification._id } },
        { new: true }
      );
      notification.receiver = user._id;
      await notification.save();
      if (user) {
        return { notification, message, user };
      }
    }
  } catch (error) {
    console.log(error);
  }
}
// export async function