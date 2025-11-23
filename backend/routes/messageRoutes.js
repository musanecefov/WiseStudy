import express from "express";
import {
    getMessagesByChannel,
    uploadFile,
    deleteMessage,
    editMessage
} from "../controllers/messageController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const messageRoute = express.Router();

// Get messages for a channel
messageRoute.get("/:channelId", authMiddleware, getMessagesByChannel);

// Upload file/image
messageRoute.post("/upload", authMiddleware, uploadFile);

// Delete a message
messageRoute.delete("/:messageId", authMiddleware, deleteMessage);

// Edit a message
messageRoute.put("/:messageId", authMiddleware, editMessage);

export default messageRoute