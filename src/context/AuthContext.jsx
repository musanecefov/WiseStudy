import { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);

    // ✅ Logout user completely
    const logout = () => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    // -------------------------------------------------------
    // ✅ Auto-check JWT expiration
    // -------------------------------------------------------
    useEffect(() => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;

            if (decoded.exp < now) {
                console.log("Access token expired. Logging out...");
                logout();
            }
        } catch (err) {
            console.log("Invalid token. Logging out...");
            logout();
        }
    }, [token]);

    // -------------------------------------------------------
    // LOGIN FUNCTION
    // -------------------------------------------------------
    const login = async (username, password) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.ok) {
            setUser(data.user);
            setToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
        }

        return { ok: res.ok, data };
    };

    // -------------------------------------------------------
    // REFRESH ACCESS TOKEN AUTOMATICALLY
    // -------------------------------------------------------
    const refreshAccessToken = async () => {
        if (!refreshToken) return logout();

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("accessToken", data.accessToken);
                setToken(data.accessToken);
                return data.accessToken;
            } else {
                logout();
            }
        } catch {
            logout();
        }
    };

    // -------------------------------------------------------
    // FETCH WITH AUTH → auto refresh on 401
    // -------------------------------------------------------
    const fetchWithAuth = async (url, options = {}) => {
        let currentToken = token;

        let response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: currentToken ? `Bearer ${currentToken}` : "",
            },
        });

        // If token expired → try refresh
        if (response.status === 401) {
            const newToken = await refreshAccessToken();

            if (!newToken) return response;

            response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${newToken}`,
                },
            });
        }

        return response;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, fetchWithAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

