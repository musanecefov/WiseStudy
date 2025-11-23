import express from "express";
import Channel from "../models/Channel.js";

const channelRoute = express.Router();

// Find or create a channel by subject name
channelRoute.post("/getOrCreate", async (req, res) => {
    try {


        const { subject } = req.body;
        if (!subject) {
            return res.status(400).json({ message: "Subject is required" });
        }

        // Find existing or create new channel
        let channel = await Channel.findOne({ subject });
        if (!channel) {
            channel = await Channel.create({
                name: subject,
                subject,
                description: `Chat for ${subject}`,
            });
        }

        res.status(200).json({channel});
    } catch (error) {
        console.error("Error in /getOrCreate:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default channelRoute;
