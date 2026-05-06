import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import signupHero from "../assets/img/signup-user.png";

export const SignupUser = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function sendData(e) {
        e.preventDefault();

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/signup/user", requestOptions)
            .then(response => {
                return response.json().then(data => ({
                    status: response.status,
                    data: data
                }));
            })
            .then(({ status, data }) => {
                if (status === 201) {
                    navigate("/user/login");
                } else {
                    setError(data.msg || "Error al registrar usuario");
                }
            })
            .catch(() => {
                setError("Error de conexi\u00f3n con el servidor");
            });
    }

    return (
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-hero">
                    <h1 className="auth-hero-title">My Account</h1>

                    <div className="auth-breadcrumb">
                        <Link to="/">Home</Link>
                        <span>&gt;</span>
                        <span>Register</span>
                    </div>
                    <div className="auth-hero-image">
                        <img src={signupHero} alt="User with dogs" />
                    </div>
                </div>

                <div className="auth-panel">
                    <form className="auth-card" onSubmit={sendData} noValidate>
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">Register to access your account</p>

                        <div className="auth-field">
                            <label htmlFor="signupName">Name</label>
                            <input
                                id="signupName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signupEmail">Email Address</label>
                            <input
                                id="signupEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="signupPassword">Password</label>
                            <input
                                id="signupPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </div>

                        {error && (
                            <p style={{ color: "red", marginBottom: "20px" }}>
                                {error}
                            </p>
                        )}

                        <div className="auth-actions">
                            <button type="submit" className="auth-btn">
                                Register
                            </button>

                            <Link to="/user/login" className="auth-secondary-btn">
                                Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
