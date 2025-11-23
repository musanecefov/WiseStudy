import { StudentAnswer } from "../models/StudentAnswer.js";
import {Question} from "../models/Question.js"
import mongoose from "mongoose";

// Record or update an answer
export const recordAnswer = async (req, res) => {
    try {
        const { studentId, questionId, correct, selectedOption, timeTaken } = req.body;

        if (!studentId || !questionId || selectedOption === undefined || correct === undefined) {
            return res.status(400).json({ message: "Missing fields." });
        }

        const newAttempt = new StudentAnswer({
            studentId,
            questionId,
            correct,
            selectedOption,
            timeTaken,
        });

        await newAttempt.save();

        res.status(201).json({
            message: "Attempt saved.",
            attempt: newAttempt
        });

    } catch (err) {
        console.error("Error saving attempt:", err);
        res.status(500).json({ message: "Server error." });
    }
};


// Get all answers for a student
export const getStudentAnswers = async (req, res) => {
    try {
        const { studentId } = req.params;

        const answers = await StudentAnswer.find({
            studentId: new mongoose.Types.ObjectId(studentId)
        })
            .populate("questionId")
            .sort({ attemptedAt: -1 });

        res.status(200).json(answers);
    } catch (error) {
        console.error("Error fetching student answers:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// Get answer for a specific question
export const getAnswerForQuestion = async (req, res) => {
    try {
        const { studentId, questionId } = req.params;

        const answer = await StudentAnswer.findOne({
            studentId: new mongoose.Types.ObjectId(studentId),
            questionId: new mongoose.Types.ObjectId(questionId),
        });

        if (!answer) {
            return res.status(200).json({ attempted: false });
        }

        res.status(200).json({
            attempted: true,
            correct: answer.correct,
            attemptedAt: answer.attemptedAt,
            answer,
        });
    } catch (error) {
        console.error("Error fetching question attempt:", error);
        res.status(500).json({ message: "Server error." });
    }
};

export const getAttemptsForQuestion = async (req,res) => {
  try{
      const {studentId, questionId} = req.params;

      const attempts = await StudentAnswer.find({
          studentId,
          questionId,
      }).sort({ attemptedAt: -1 });

      res.status(200).json({ attempts });
  }catch(err){
      console.error("Error fetching attempts:", err);
      res.status(500).json({ message: "Server error." });
  }
};


export const getStudentResults = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid studentId" });
        }

        // Aggregate last attempt per question
        const lastAttempts = await StudentAnswer.aggregate([
            { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
            { $sort: { attemptedAt: -1 } }, // newest first
            {
                $group: {
                    _id: "$questionId",
                    lastAttempt: { $first: "$$ROOT" },
                },
            },
        ]);

        // Populate question info
        const questionIds = lastAttempts.map(a => a._id);
        const questions = await Question.find({ _id: { $in: questionIds } });

        // Merge lastAttempts with question data
        const result = lastAttempts.map(a => {
            const question = questions.find(q => q._id.equals(a._id));
            return {
                _id: question._id,
                question,
                lastAttempt: a.lastAttempt,
            };
        });

        res.status(200).json({ lastAttempts: result });

    } catch (err) {
        console.error("Error fetching student results:", err);
        res.status(500).json({ message: "Server error" });
    }
};

