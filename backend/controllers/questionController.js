import { Question } from '../models/Question.js';
import { validationResult } from 'express-validator';


export const addQuestion = async (req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()});
        }

        const data=req.body;

        await Question.create(data);

        res.status(201).json({ message: 'Questions added successfully.' });

    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }

};



export const getQuestion= async (req,res)=>{
    try{

        const subject=req.query.subject;
        const topic=req.query.topic;

        const filter={};
        if(subject) filter.subject=subject;
        if(topic) filter.topic=topic;

        const questions = await Question.find(filter).select('-__v -createdAt -updatedAt');

        if(questions.length===0){
            return res.status(400).json({message:"No questions found for this topic or subject."});

        }else{
            res.status(200).json(questions);
        }


    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error',error:err.message });
    }
}


export const deleteQuestion = async (req,res)=>{
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({ message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
