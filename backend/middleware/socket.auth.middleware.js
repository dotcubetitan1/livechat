import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized - No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("Unauthorized - User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    next(new Error("Unauthorized"));
  }
};
