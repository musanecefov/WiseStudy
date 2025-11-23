import mongoose from 'mongoose';
const Schema=mongoose.Schema;


const userSchema = new Schema({
    username: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    role:{
      type:String,
      enum:["user","admin"],
      default:"user",
    },
    password: {
        type:String,
        required:true,
        minlength:6
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically sets creation timestamp
    },
    refreshToken: String
})


export default mongoose.model('User',userSchema);