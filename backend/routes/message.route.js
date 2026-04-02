import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getAllMedia,
  getOnlineUsers
} from "../controllers/message.controller.js";
import verifyToken from "../middleware/verifyToken.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/getAllContacts", verifyToken, getAllContacts);
router.get("/getMessagesByUserId/:id", verifyToken, getMessagesByUserId);
router.post("/sendMessage/:id", verifyToken, upload.array("images"), sendMessage);
router.get("/getAllMedia", getAllMedia);
router.get("/getOnlineUsers", verifyToken, getOnlineUsers)


export default router;
