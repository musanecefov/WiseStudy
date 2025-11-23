import express from 'express';
import { validateQuestion } from '../validations/questionValidator.js';
import {addQuestion, deleteQuestion, getQuestion} from '../controllers/questionController.js';

const questionRoute=express.Router();

questionRoute.post('/',validateQuestion,addQuestion);
questionRoute.get('/',getQuestion);
questionRoute.delete('/:id',deleteQuestion);

export default questionRoute;