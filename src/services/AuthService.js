// src/services/AuthService.js

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

export async function registerUser(username, email, password, password_confirmation) {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, password_confirmation }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
}

export async function loginUser(username, password) {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save token in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ username }));

    return data;
}

export function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}
