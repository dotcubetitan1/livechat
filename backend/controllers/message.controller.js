import { getReceiverSocketId, getIO, userSocketMap } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import sendPushNotification from "../services/notification.js"

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: [myId] }
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, lat, lng } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "Cannot send message to yourself" });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    const imageUrl = [];
    const videoUrl = [];
    const audioUrl = [];

    req.files?.forEach((file) => {
      if (file.mimetype.startsWith("image")) {
        imageUrl.push(file.path);
      } else if (file.mimetype.startsWith("video")) {
        videoUrl.push(file.path);
      } else if (file.mimetype.startsWith("audio")) {
        audioUrl.push(file.path);
      }
    });

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      images: imageUrl,
      videos: videoUrl,
      audios: audioUrl,
      location: lat && lng ? { lat, lng } : null
    });

    const receiver = await User.findById(receiverId)
    const sender = await User.findById(senderId)

    const imageCount = imageUrl.length;
    const videoCount = videoUrl.length;
    const audioCount = audioUrl.length;

    let notificationText = text || ""
    if (!text) {
      if (imageCount && !videoCount && !audioCount) {
        notificationText = `${imageCount} Photo`
      } else if (videoCount && !imageCount && !audioCount) {
        notificationText = `${videoCount} Video`
      } else if (audioCount && !imageCount && !videoCount) {
        notificationText = `${audioCount} Audio`
      } else {
        let parts = [];
        if (imageCount) parts.push(`${imageCount} Photo`);
        if (videoCount) parts.push(`${videoCount} Video`);
        if (audioCount) parts.push(`${audioCount} Audio`);
        notificationText = parts.join(", ")
      }
    }

    if (receiver?.fcmToken) {
      await sendPushNotification(
        receiver.fcmToken,
        sender.fullName,
        notificationText,
        {
          senderId: senderId.toString(),
          imageCount,
          videoCount,
          audioCount,

        }
      )
    }
    const io = getIO();
    io.to(receiverId.toString()).emit("newMessage", newMessage);
    console.log(`Message sent to room: ${receiverId}`);

    // Sender ko bhejo (Doosre devices/tabs ke liye)
    // io.to(senderId.toString()).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    const messages = await Message.find().lean();

    const allVideos = [...new Set(messages.flatMap(m => m.videos || []))];
    const allImages = [...new Set(messages.flatMap(m => m.images || []))];
    const allAudios = [...new Set(messages.flatMap(m => m.audios || []))];

    res.status(200).json({
      allVideo: allVideos,
      allImage: allImages,
      allAudio: allAudios
    });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = Object.keys(userSocketMap)
    res.json({ message: "online user fetch", onlineUsers })
  } catch (error) {
    res.status(500).json({ message: "error.message" });
  }
}

export const messageDeleteByUser = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body; // "forme" | "foreveryone"
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // DELETE FOR ME — sirf apne liye hide karo
    if (deleteType === "forme") {
      // Already deleted check
      const alreadyDeleted = message.deletedFor.some((id) =>
        id.equals(userId)
      );
      if (alreadyDeleted) {
        return res
          .status(400)
          .json({ message: "Message already deleted for you" });
      }

      message.deletedFor.push(userId);
      await message.save();

      return res.status(200).json({
        success: true,
        message: "Message deleted for you",
        data: message,
      });
    }
    console.log("senderId", message.senderId)
    console.log("receiverId", message.receiverId)
    // DELETE FOR EVERYONE — WhatsApp jaisi time limit (60 min)
    if (deleteType === "foreveryone") {
      // Sirf sender delete kar sakta hai
      if (!message.senderId.equals(userId)) {
        return res.status(400).json({
          message: "Only sender can delete message for everyone",
        });
      }

      // Already deleted check
      if (message.deletedForEveryone) {
        return res.status(400).json({
          message: "Message already deleted for everyone",
        });
      }

      // Time limit check — 60 minutes
      const now = new Date();
      const sentAt = new Date(message.createdAt);
      const diffInMinutes = (now - sentAt) / (1000 * 60);
      console.log(diffInMinutes)
      if (diffInMinutes > 60) {
        return res.status(400).json({
          message: "Cannot delete for everyone after 60 minutes",
        });
      }

      message.deletedForEveryone = true;
      // Content clear karo (WhatsApp style)
      message.text = "";
      message.images = [];
      message.videos = [];
      message.audios = [];
      message.location = null;
      await message.save();

      // Socket se dono side notify karo
      const io = getIO();
      const receiverSocketId = getReceiverSocketId(
        message.receiverId.toString()
      );
      const senderSocketId = getReceiverSocketId(userId.toString());

      const payload = { messageId, deletedForEveryone: true };

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", payload);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", payload);
      }

      return res.status(200).json({
        success: true,
        message: "Message deleted for everyone",
        data: message,
      });
    }

    // Invalid deleteType
    return res.status(400).json({
      message: "Invalid deleteType. Use 'forme' or 'foreveryone'",
    });
  } catch (error) {
    console.error("Error in messageDeleteByUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

