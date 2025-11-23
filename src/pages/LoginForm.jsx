import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function LoginForm() {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // We only need the login function from context
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 1. Call the Context login function directly.
            // We pass the raw text inputs, NOT the result of another fetch.
            const result = await login(formData.username, formData.password);

            // 2. Check the result from the context
            if (result.ok) {
                navigate("/"); // Success! Redirect to home
            } else {
                // If backend sends an error message, show it
                setError(result.data.message || "Login failed");
            }

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <section className="flex items-center justify-center font-mono bg-gradient-to-r from-cyan-500 from-10% via-indigo-500 via-50% to-sky-500 to-100% py-15">
            <div className="flex shadow-2xl">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-center justify-center p-15 gap-8 bg-white rounded-lg"
                >
                    <img
                        src="/wisestudy.logo.png"
                        alt="Logo"
                        className="w-24 h-24 object-contain mx-auto"
                    />
                    <h1 className="text-3xl font-bold">Xoş gəlmisiniz!</h1>

                    {error && <p className="text-red-500">{error}</p>}

                    <div className="flex flex-col text-xl text-left gap-1">
                        <span>İstifadəçi adı</span>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                            required
                        />
                    </div>

                    <div className="flex flex-col text-xl text-left gap-1">
                        <span>Şifrə</span>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="rounded-md p-1 border-2 outline-none focus:border-cyan-400 focus:bg-slate-50"
                            required
                        />
                    </div>

                    <div className="flex gap-1 items-center">
                        <input type="checkbox" />
                        <span className="text-base">Girişi yadda saxla</span>
                    </div>

                    <button className="px-10 py-2 text-2xl rounded-md bg-gradient-to-tr from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-white">
                        Daxil ol
                    </button>

                    <p className="font-semibold">
                        Hesabın yoxdur?{" "}
                        <Link
                            to="/signup"
                            className="text-blue-400 hover:underline"
                        >
                            Qeydiyyatdan keçin
                        </Link>
                    </p>
                </form>
            </div>
        </section>
    );
}