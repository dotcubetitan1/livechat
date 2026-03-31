import { getReceiverSocketId, getIO } from "../lib/socket.js";
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
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  console.log("🔥 API called:", new Date().toISOString());
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

    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);

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
    console.log("Receiver FCM Token:", receiver?.fcmToken);
    console.log("Receiver Socket ID:", receiverSocketId);
    if (receiver?.fcmToken) {
      await sendPushNotification(
        receiver.fcmToken,
        sender.fullName,
        notificationText,
        {
          imageCount,
          videoCount,
          audioCount,

        }
      )
    }

    if (receiverSocketId) {
      console.log("Message sent to receiver via socket");
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    const senderSocketId = getReceiverSocketId(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

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


