import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../models/User.js";

// Register user
export const registerUser = async (req, res) => {
    const { username, email, password, password_confirmation } = req.body;
    try {
        if (password !== password_confirmation) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const isFirstUser = (await User.countDocuments({})) === 0;

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: isFirstUser ? "admin" : "user", // First user becomes admin
        });

        await newUser.save();

        res.status(201).json({
            message: `User successfully registered${isFirstUser ? " as admin" : ""}`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// Login user
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        // ✅ Include role in returned user object
        res.json({
            message: 'User logged in successfully',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Refresh token
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken)
            return res.status(403).json({ message: 'Invalid refresh token' });

        const newAccessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

/*export const getUserResults =async (req,res)=>{
    try{
        const user=await User.findById(req.user.id);
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }

        const userProgress=user.progress;
        res.json({userProgress});

    }catch(err){
        console.error(err);
        res.status(500).json({message:'Server Error'});
    }
}*/