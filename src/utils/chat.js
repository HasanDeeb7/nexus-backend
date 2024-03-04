import Message from "../models/messageModel.js";
import Room from "../models/roomModel.js";
import User from "../models/userModel.js";

export async function createRoom(user1, user2) {
  const existingRoom1 = await Room.findOne({
    users: { $all: [user1._id, user2._id] },
  });

  const existingRoom2 = await Room.findOne({
    users: { $all: [user2._id, user1._id] },
  });

  if (existingRoom1) {
    return null;
  } else if (existingRoom2) {
    return null;
  } else {
    const newRoom = new Room({
      users: [user1._id, user2._id],
      // Add other fields if needed
    });
    await newRoom.save();
    return newRoom;
  }
}
export async function saveMessage(sender, receiver, messageContent) {
  try {
    const receiverUser = await User.findOne({ username: receiver });

    if (sender && receiverUser) {
      // Find the room where both sender and receiver are participants
      const room = await Room.findOne({
        $or: [
          { users: { $all: [sender._id, receiverUser._id] } },
          { users: { $all: [receiverUser._id, sender._id] } },
        ],
      });

      if (room) {
        // Create a new message
        const message = await Message.create({
          sender: sender._id,
          receiver: receiverUser._id,
          content: messageContent,
        });

        // Push the message to the room's messages array
        room.messages = room.messages ? room.messages : [];
        room.messages.push(message._id);
        await room.save();

        return { success: true, message: "Message saved successfully", room };
      } else {
        return { success: false, message: "Room not found" };
      }
    } else {
      return { success: false, message: "Sender or receiver not found" };
    }
  } catch (error) {
    console.error("Error saving message:", error);
    return {
      success: false,
      message: "An error occurred while saving the message",
    };
  }
}
