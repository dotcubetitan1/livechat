import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Group from "../models/Group.js";

let io;
export const userSocketMap = {}; // { userId: socketId }

export const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: false,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.user.fullName || socket.user.email);

    const userId = socket.userId;
    // console.log(typeof userId , userId )

    // Array initialize karein agar pehli baar login hai
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = []
    }
    userSocketMap[userId].push(socket.id);
    socket.join(userId)

    const groups = await Group.find({ participants: userId }).select("_id").lean();
    groups.forEach((group) => {
      socket.join(group._id.toString())
      console.log(`user ${socket.user.fullName} join the group `)
    })

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    console.log(`User ${socket.user.fullName} connected. Device count: ${userSocketMap[userId].length}`);
    console.log("Current online users:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      // Sirf wahi socket ID remove karein jo disconnect hui hai
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id)

      // Agar koi bhi device online nahi bacha, tabhi map se delete karein 
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
        console.log(`User ${userId} fully disconnected from all devices.`);
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
  return io;
};

export const getReceiverSocketId = (userId) => {
  const userIdString = userId.toString();
  console.log(" Available users:", Object.keys(userSocketMap));
  return userSocketMap[userIdString] || [];
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};
