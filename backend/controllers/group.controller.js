import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { getReceiverSocketId, getIO, userSocketMap } from "../lib/socket.js";

export const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body;
        const participant = JSON.parse(participants)
        const adminId = req.user._id;
        const groupIcon = req.file ? req.file.path : ""
        console.log(groupIcon)
        const newGroup = await Group.create({
            groupName: groupName,
            groupIcon: groupIcon,
            admin: [adminId],
            participants: [...participant, adminId],
        })
        res.status(200).json({
            success: true,
            message: "Group created successFully",
            data: newGroup
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
export const sendGroupMessage = async (req, res) => {
    try {
        const { text, lat, lng, groupId } = req.body;
        const senderId = req.user._id;

        if (!groupId) {
            return res.status(400).json({ message: "groupId is required" });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
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
            groupId,
            text: text || "",
            images: imageUrl,
            videos: videoUrl,
            audios: audioUrl,
            location: lat && lng ? { lat, lng } : null,
        });

        group.lastMessage = newMessage._id;
        await group.save();

        const io = getIO();
        io.to(groupId).emit("newMessage", newMessage);
        console.log(`Message sent to group: ${groupId}`);

        return res.status(200).json({
            success: true,
            message: "Message sent in group",
            data: newMessage,
        });

    } catch (error) {
        console.error("Error in sendGroupMessage:", error);
        res.status(500).json({ message: "server error", error });
    }
};
export const getMyGroups = async (req, res) => {
    try {
        const loginUserId = req.user._id;
        const groups = await Group.find({ participants: loginUserId }).
            lean().select("groupName groupIcon admin participants ")
        res.status(200).json({
            success: true,
            message: "Fetched groups",
            data: groups
        })
    } catch (error) {
        res.status(500).json({ message: "error.message" })
    }
}
export const getGroups = async (req, res) => {
    try {
        const {groupId} = req.params;
        const groups = await Group.findById({_id:groupId}).
            lean().select("groupName groupIcon admin participants ")
        res.status(200).json({
            success: true,
            message: "Fetched groups",
            data: groups
        })
    } catch (error) {
        res.status(500).json({ message: "error.message" })
    }
}
export const getGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({
            groupId: groupId,
            deletedForEveryone: { $ne: true }
        }).select("senderId text images videos audios location deletedFor deletedForEveryone isEdited").lean().sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            message: "Get message",
            data: messages
        })
    } catch (error) {
        res.status(500).json({ message: "error.message" })
    }
}
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const group = await Group.findById(groupId);
        if (!group) return res.status(400).json({ message: "Group not found" })
        if (!group.admin.includes(req.user._id)) {
            return res.status(400).json({ message: "Only admin can add members" })
        }
        if (!group.participants.includes(userId)) {
            group.participants.push(userId)
            await group.save();
        }
        res.status(200).json({
            success: true,
            message: "Member added",
            data: null
        })
    } catch (error) {
        res.status(500).json({ message: "error.message" })
    }
}
export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;
        const group = await Group.findById(groupId);
        group.participants = group.participants.filter((id) => id.toString() !== userId)
        await group.save()
        res.status(200).json({
            success: true,
            message: "Member removed",
            data: null
        })
    } catch (error) {
        res.status(500).json({ message: "error.message" })
    }
}