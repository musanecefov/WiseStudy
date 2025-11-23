import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const questionSchema = new Schema({
   subject: {
       type:String,
       enum:['azerbaijani','math','english'],
       required:true,
   },
   topic: {
       type:String,
       required:true,
       lowercase:true,
       trim:true
   },
   text: {
       type:String,
       required:true,
       trim:true
   },
   options: {
       type: [String],
       required: true,
       validate:{
           validator: function(v){
                return v && v.length>=4;
           },
           message:'A question must have at least 4 options'
       }

   },
   correctAnswer: {
       type:Number,
       required:true,
       validate:{
           validator: function(v){
               return v<this.options.length;
           },
           message:'A correct answer must be one of the following options.'
       }
   },
   explanation: {
       type:String,
       required:false,
       default:"",
   }
}, { timestamps: true });


export const Question = mongoose.model('Question', questionSchema);




