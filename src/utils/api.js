export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(url, { ...options, headers, credentials: "include" });

    // If token expired → try to refresh
    if (res.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        const refreshed = await fetch("http://localhost:3000/api/users/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken }),
            credentials: "include",
        });

        if (refreshed.ok) {
            const data = await refreshed.json();
            localStorage.setItem("token", data.accessToken);

            // Retry original request
            return apiFetch(url, options);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }

    return res;
}

