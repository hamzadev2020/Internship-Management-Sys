import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import "./Login.css";


export const Login = () => {

    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleInput = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/api/auth/login", credentials);

            // 1. Store auth data in sessionStorage
            sessionStorage.setItem("token", res.data.token);
            sessionStorage.setItem("role", res.data.user.role);

            console.log("Login successful. Token:", res.data.token);
            console.log("User Role:", res.data.user.role);

            // 2. Navigate based on user role
            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else if (res.data.user.role === "Intern") {
                navigate("/intern");
            } else {
                // Fix: this message used to be overwritten right below, and the token stayed stored
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                setMessage("Unknown role. Cannot navigate.");
                return;
            }

            setMessage(res.data.message);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            setMessage(errorMessage);
        }
    }


    return (
        <div className="login-page">

            <aside className="login-brand">
                <h1>TaskFlow</h1>
                <p>Assign, track and review intern tasks in one place.</p>
            </aside>

            <main className="login-main">
                <div className="login-card">

                    <h2>Welcome back</h2>
                    <p className="login-sub">Login to continue to TaskFlow.</p>

                    {message && <p className="login-error">{message}</p>}

                    <form className="login-form" onSubmit={handleSubmit}>

                        <div className="login-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                onChange={handleInput}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                onChange={handleInput}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn">
                            Login
                        </button>

                    </form>

                </div>
            </main>

        </div>
    )
}