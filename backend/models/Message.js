import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    content: {type: String, required: false},
    sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    channel: {type: mongoose.Schema.Types.ObjectId, ref: "Channel"},
    imageUrl:{type: String, trim: true},
    createdAt: {type: Date, default: Date.now},
    edited: { type: Boolean, default: false },
    editedAt: { type: Date }
    },
    {timestamps: true}
)


messageSchema.pre("validate", function (next) {
    if (!this.content && !this.imageUrl) {
        this.invalidate("content", "Message must have either text or image.");
    }
    next();
});

export default mongoose.model('Message',messageSchema);