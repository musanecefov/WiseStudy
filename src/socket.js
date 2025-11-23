// src/socket.js
import { io } from "socket.io-client";

// Mühit dəyişənlərindən istifadə edin
// Bu, Vercel-də https://wisestudy-backend.onrender.com olacaq
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

// Get token from localStorage (or wherever you store it after login)
const token = localStorage.getItem("accessToken");

const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: {
        token, // send JWT for authentication
    },
});

socket.on("connect", () => {
    console.log("✅ Connected to socket server:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
});

export default socket;