import { createContext, useContext, useState } from "react";
import { useStudentAnswerApi } from "../api/studentAnswerApi";
import { AuthContext } from "./AuthContext";

export const StudentAnswerContext = createContext();

export const StudentAnswerProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const { recordAnswer, getStudentAnswers, getAnswerForQuestion } =
        useStudentAnswerApi();

    const [answers, setAnswers] = useState({});
    // Structure:
    // answers[questionId] = { correct: true/false, attemptedAt: "..." }

    // Load all answers of the current user
    const loadAnswers = async () => {
        if (!user) return;

        const res = await getStudentAnswers(user.id);
        if (res.data) {
            const formatted = {};
            res.data.forEach((a) => {
                formatted[a.questionId] = {
                    correct: a.correct,
                    attemptedAt: a.attemptedAt,
                };
            });
            setAnswers(formatted);
        }
    };

    // Check if user has answered a specific question
    const getAnswerFor = async (questionId) => {
        if (!user) return null;
        if (answers[questionId]) return answers[questionId];

        const res = await getAnswerForQuestion(user.id, questionId);

        if (res.data) {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: {
                    correct: res.data.correct,
                    attemptedAt: res.data.attemptedAt,
                },
            }));
            return res.data;
        }
        return null;
    };

    // Save new answer
    const saveAnswer = async (questionId, correct) => {
        if (!user) return;

        const res = await recordAnswer(user.id, questionId, correct);

        if (res.data) {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: {
                    correct,
                    attemptedAt: new Date().toISOString(),
                },
            }));
        }

        return res;
    };

    return (
        <StudentAnswerContext.Provider
            value={{
                answers,
                loadAnswers,
                saveAnswer,
                getAnswerFor,
            }}
        >
            {children}
        </StudentAnswerContext.Provider>
    );
};
