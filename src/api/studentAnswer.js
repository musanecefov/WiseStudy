import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useStudentAnswerApi = () => {
    const { fetchWithAuth } = useContext(AuthContext);

    const recordAnswer = async (studentId, questionId, correct) => {
        return await fetchWithAuth("http://localhost:3000/api/student-answers/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, questionId, correct }),
        });
    };

    const getStudentAnswers = async (studentId) => {
        return await fetchWithAuth(`http://localhost:3000/api/student-answers/answers/${studentId}`);
    };

    const getAnswerForQuestion = async (studentId, questionId) => {
        return await fetchWithAuth(`http://localhost:3000/api/student-answers/answers/${studentId}/${questionId}`);
    };

    return { recordAnswer, getStudentAnswers, getAnswerForQuestion };
};

