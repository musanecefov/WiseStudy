import express from 'express';
import {
    recordAnswer,
    getStudentAnswers,
    getAnswerForQuestion,
    getAttemptsForQuestion, getStudentResults
} from "../controllers/studentAnswerController.js";


const studentAnswerRoute=express.Router();

studentAnswerRoute.post('/answers',recordAnswer);
studentAnswerRoute.get('/answers/:studentId', getStudentAnswers);
studentAnswerRoute.get('/answers/:studentId/:questionId',getAnswerForQuestion)
studentAnswerRoute.get('/answers/attempts/:studentId/:questionId',getAttemptsForQuestion);
studentAnswerRoute.get('/results/:studentId', getStudentResults);

export default studentAnswerRoute;