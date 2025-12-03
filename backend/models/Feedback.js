import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const feedbackSchema = new Schema({
    userId : { type: mongoose.Schema.Types.ObjectId, ref:"User", required: false},
    type: { type: String, enum: ["feedback","bug"], required: true },
    text: { type: String, required: true, trim : true},
    page : { type: String, required: false},
    screenshot: { type: String } ,
    meta : {
        userAgent: { type: String },
        extra:{ type: Schema.Types.Mixed},
    },
    resolved: { type: Boolean , default: false},
    createdAt : { type: Date , default: Date.now() },
});


export const Feedback = mongoose.model('Feedback',feedbackSchema)