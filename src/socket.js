// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

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



