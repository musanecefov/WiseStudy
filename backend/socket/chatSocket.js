import Message from "../models/Message.js";

export default function setupChatSocket(io) {
    io.on("connection", (socket) => {
        console.log("🟢 A user connected:", socket.id);

        socket.on("joinChannel", (channelId) => {
            socket.join(channelId);
            console.log(`User joined channel: ${channelId}`);
        });

        socket.on("leaveChannel", (channelId) => {
            socket.leave(channelId);
            console.log(`User left channel: ${channelId}`);
        });

        socket.on("sendMessage", async (data) => {
            try {
                const { content, channelId, senderId } = data;

                const msgContent = content && content.trim() !== "" ? content : null;

                const message = new Message({
                    content: msgContent,
                    imageUrl: null,
                    channel: channelId,
                    sender: senderId,
                });

                await message.save();

                const populatedMessage = await message.populate("sender", "username avatar");

                io.to(channelId).emit("newMessage", populatedMessage);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });

        // *** FIX APPLIED: REMOVED UNSAFE HANDLERS ***
        // The delete/edit logic is now handled securely in messageController.js
        // via Express routes (DELETE/PUT requests) which performs auth and DB checks.
        // The controller then broadcasts the 'messageDeleted'/'messageEdited' events.
        // ********************************************

        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });
}