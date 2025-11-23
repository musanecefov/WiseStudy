import mongoose from "mongoose";
const Schema = mongoose.Schema;

const studentAnswerSchema = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "question", required: true },

    selectedOption: { type: Number, required: true },   // <--- add this
    correct: { type: Boolean, required: true },

    timeTaken: { type: Number, default: 0 },            // <--- optional (ms)
    attemptedAt: { type: Date, default: Date.now }
});

export const StudentAnswer = mongoose.model("StudentAnswer", studentAnswerSchema);
