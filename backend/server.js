import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import questionRoute from "./routes/questionRoutes.js";
import channelRoute from "./routes/channelRoutes.js";
import messageRoute from "./routes/messageRoutes.js";
import { connectDb } from "./config/db.js";
import setupChatSocket from "./socket/chatSocket.js";
import studentAnswerRoute from "./routes/studentAnswerRoutes.js"
import feedbackRoute from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());

// CORS Configuration (Backend)
app.use(
    cors({
        // Yalnız Render-də təyin etdiyimiz CLIENT_URL istifadə edilir
        origin:  [
        "https://wisestudy.org",
        "https://www.wisestudy.org"
        ],
        credentials: true,
    })
);



const server = http.createServer(app);

// Create Socket.io BEFORE attaching req.io
const io = new Server(server, {
    cors: {
        // Socket.io üçün də CLIENT_URL istifadə edilir
        origin: ['https://wisestudy.org',"https://www.wisestudy.org"],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Attach io after it exists
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoute);
app.use("/api/channels", channelRoute);
app.use("/api/messages", messageRoute);
app.use("/uploads", express.static("uploads"));
app.use('/api/student-answers', studentAnswerRoute);
app.use("/api/feedback", feedbackRoute);

// DB connect
connectDb();

// Socket.io handlers
setupChatSocket(io);

// Start server
const PORT = process.env.PORT || 10000; // Render 10000 portunu istifadə edir
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));