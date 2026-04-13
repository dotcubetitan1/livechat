import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String
    },
    groupIcon: {
        type: String
    },
    description: {
        type: String
    },
    admin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;