import Message from "../models/Message.js";
import multer from "multer";
import fs from "fs";

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split(".").pop();
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + extension;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// GET messages by channel
export const getMessagesByChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        const messages = await Message.find({ channel: channelId })
            .populate("sender", "username avatar")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST file/image upload
export const uploadFile = [
    upload.single("file"),
    async (req, res) => {
        try {
            const { channelId, content } = req.body;
            // Unified user ID extraction
            const senderId = req.user?._id || req.user?.id || req.user?.userId;

            if (!senderId) {
                return res.status(401).json({ message: "User not authenticated" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const fileUrl = `/uploads/${req.file.filename}`;

            const message = new Message({
                content: content && content.trim() !== "" ? content : null,
                imageUrl: fileUrl,
                channel: channelId,
                sender: senderId,
            });

            await message.save();

            // *** RECOMMENDATION: ADD SOCKET EMISSION FOR FILE UPLOAD ***
            const io = req.io;
            if (io) {
                // Populate the message before sending it over the socket
                const populatedMessage = await message.populate("sender", "username avatar");
                io.to(channelId).emit("newMessage", populatedMessage);
            }
            // **********************************************************

            res.json({
                message: "File uploaded successfully",
                file: fileUrl,
                messageId: message._id,
            });
        } catch (err) {
            console.error("File upload error:", err);
            res.status(500).json({ message: "File upload failed" });
        }
    },
];

// DELETE message
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // We populate the sender to check authorization and get the channel ID for the socket broadcast
        const message = await Message.findById(messageId).populate("sender", "_id username avatar");

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Handle "Zombie" messages (sender was deleted from DB)
        if (!message.sender) {
            console.warn(`Attempted to delete orphaned message ${messageId}`);
            return res.status(400).json({
                message: "Message sender no longer exists in database. Cannot verify ownership."
            });
        }

        if (message.sender._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own messages" });
        }

        // Delete file from filesystem if exists (Code is correct)
        if (message.imageUrl) {
            const filePath = `.${message.imageUrl}`;
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.error("Error deleting file:", e);
                }
            }
        }

        await Message.findByIdAndDelete(messageId);

        // *** FIX APPLIED: SOCKET EMISSION ADDED AFTER SUCCESSFUL DB OPERATION ***
        const io = req.io;
        if (io) {
            io.to(message.channel.toString()).emit("messageDeleted", {
                messageId: message._id.toString(),
                channelId: message.channel.toString(),
            });
        }
        // ************************************************************************

        res.json({ message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ message: "Failed to delete message", error: err.message });
    }
};

// PUT/PATCH edit message
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Content cannot be empty" });
        }

        const message = await Message.findById(messageId).populate("sender", "_id username avatar");

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check for Zombie Data
        if (!message.sender) {
            return res.status(400).json({
                message: "Message sender not found. The user account may have been deleted."
            });
        }

        if (message.sender._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own messages" });
        }

        // Update fields
        message.content = content.trim();
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // *** FIX APPLIED: SOCKET EMISSION ADDED AFTER SUCCESSFUL DB OPERATION ***
        const io = req.io;
        if (io) {
            // Send back the updated data needed by the frontend listener
            io.to(message.channel.toString()).emit("messageEdited", {
                messageId: message._id.toString(),
                content: message.content,
                edited: message.edited,
                editedAt: message.editedAt,
            });
        }
        // ************************************************************************

        res.json({ message: "Message edited successfully", updatedMessage: message });
    } catch (err) {
        console.error("Error editing message:", err);
        res.status(500).json({ message: "Failed to edit message", error: err.message });
    }
};
