import { body } from 'express-validator';

export const validateQuestion = [
    body('*.subject').notEmpty().withMessage('Please enter a valid subject'),
    body('*.topic').notEmpty().withMessage('Please enter a topic'),
    body('*.text').notEmpty().withMessage('Text is required'),
    body('*.options')
        .isArray({ min: 4 })
        .withMessage('Options must have at least 4 elements'),
    body('*.correctAnswer').notEmpty().withMessage('Correct answer is required'),
    body('*.explanation')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Explanation must be a string'),

];
