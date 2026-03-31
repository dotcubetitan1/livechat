import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

let io;
const userSocketMap = {}; // { userId: socketId }

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://livechat-frontend-zpcx.onrender.com", // ✅ Your deployed frontend
      ],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.fullName || socket.user.email);

    const userId = socket.user._id.toString();;
    socket.join(userId);
    userSocketMap[userId] = socket.id;

    console.log("Current online users:", Object.keys(userSocketMap));

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.user.fullName);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
};

export const getReceiverSocketId = (userId) => {
  const userIdString = userId.toString();
  console.log("🔍 Looking for socket ID of user:", userIdString);
  console.log("🗺️ Available users:", Object.keys(userSocketMap));
  return userSocketMap[userIdString];
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};
