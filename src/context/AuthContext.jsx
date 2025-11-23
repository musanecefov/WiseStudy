import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);

    const login = async (username, password) => {
        const res = await fetch("http://localhost:3000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data.user); // role is included now
            setToken(data.accessToken);

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("accessToken", data.accessToken);
        }

        return { ok: res.ok, data };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
    };

    const fetchWithAuth = (url, options = {}) => {
        return fetch("http://localhost:3000" + url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
