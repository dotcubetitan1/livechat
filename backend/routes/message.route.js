import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  updateMessage,
  getAllMedia,
  getOnlineUsers,
  messageDeleteByUser,
  addEmoji,
  getUserById
} from "../controllers/message.controller.js";
import verifyToken from "../middleware/verifyToken.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/getAllContacts", verifyToken, getAllContacts);
router.get("/get-user/:id", verifyToken, getUserById);
router.get("/getMessagesByUserId/:id", verifyToken, getMessagesByUserId);
router.post("/sendMessage/:id", verifyToken, upload.array("images"), sendMessage);
router.get("/getAllMedia/:userId", verifyToken, getAllMedia);
router.get("/getOnlineUsers", verifyToken, getOnlineUsers)
router.post("/update-message/:id", verifyToken, updateMessage);
router.post("/delete-message/:messageId", verifyToken, messageDeleteByUser);
router.post("/message-reaction/:messageId", verifyToken, addEmoji)


export default router;
