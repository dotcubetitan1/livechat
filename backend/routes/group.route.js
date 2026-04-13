import express from "express";
import {
    createGroup, getGroupMessage, getMyGroups, addMember, removeMember, sendGroupMessage
} from "../controllers/group.controller.js";
import verifyToken from "../middleware/verifyToken.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create-group", verifyToken, createGroup);
router.post("/send-group-message", verifyToken, upload.array("images") ,sendGroupMessage
);
router.get("/my-groups", verifyToken, getMyGroups);
router.get("/group-messages/:groupId", verifyToken, getGroupMessage);
router.post("/add-member/:groupId", verifyToken, addMember);
router.post("/remove-member/:groupId", verifyToken, removeMember);

export default router;