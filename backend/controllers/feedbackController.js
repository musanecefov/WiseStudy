import { Feedback } from "../models/Feedback.js";

// POST /api/feedback
export const createFeedback = async (req, res) => {
    try {
        const { type, text, page, meta } = req.body;

        let screenshotBase64 = null;
        if (req.file) {
            screenshotBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        const doc = new Feedback({
            userId: req.user?.id,
            type,
            text,
            page,
            screenshot: screenshotBase64,
            meta: {
                userAgent: meta?.userAgent || req.headers["user-agent"],
                extra: meta?.extra,
            },
        });

        await doc.save();
        return res.status(201).json({ message: "Saved", feedback: doc });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};


// GET /api/feedback  (admin)
export const listFeedback = async (req, res) => {
    try {
        // 🟩 We removed the manual check here because 'adminOnly' middleware
        // in the route already guarantees the user is an admin.

        const items = await Feedback.find().sort({ createdAt: -1 }).limit(200);
        return res.status(200).json({ items });
    } catch (err) {
        console.error("listFeedback error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// PATCH to mark resolved
export const resolveFeedback = async (req, res) => {
    try {
        const { id } = req.params;

        // 🟩 Removed manual check here too. Middleware handles it.

        const f = await Feedback.findByIdAndUpdate(id, { resolved: true }, { new: true });
        if (!f) return res.status(404).json({ message: "Not found" });
        return res.status(200).json({ message: "Resolved", feedback: f });
    } catch (err) {
        console.error("resolveFeedback error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};