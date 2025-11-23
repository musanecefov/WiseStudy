import express from 'express';
import {registerUser, loginUser, refreshToken} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const userRoute = express.Router();

// Public routes
userRoute.post('/register', registerUser);
userRoute.post('/login', loginUser);
userRoute.post('/refresh',refreshToken);

userRoute.get('/me',authMiddleware, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }catch(err){
        console.error("The error message:",err);
        res.status(500).json({ message: "Server error" });
    }
});


export default userRoute;


// Example of a protected route (for testing token)
/*userRoute.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to your profile!', user: req.user });
});*/