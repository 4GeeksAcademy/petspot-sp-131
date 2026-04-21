import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const LoginUser = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function sendData(e) {
        e.preventDefault();

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/login/user", requestOptions)
            .then(response => {
                return response.json().then(data => ({
                    status: response.status,
                    data: data
                }));
            })
            .then(({ status, data }) => {
                if (status === 200 && data.access_token) {
                    dispatch({ type: "set_auth_user", payload: true });
                    localStorage.setItem("tokenUser", data.access_token);
                    setError("");
                    navigate("/private");
                } else {
                    setError(data.msg || "Email o contraseña incorrectos");
                }
            })
            .catch(() => {
                setError("Ha ocurrido un error al iniciar sesión");
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to access your private area</p>

                <form className="auth-form" onSubmit={sendData} noValidate>
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label">Email address</label>
                        <input
                            id="loginEmail"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                            type="email"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="loginPassword" className="form-label">Password</label>
                        <input
                            id="loginPassword"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            type="password"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div className="invalid-feedback d-block text-start mb-3">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary auth-btn">
                        Login
                    </button>
                </form>

                <p className="auth-link">
                    ¿No tienes cuenta? <Link to="/signup/user">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};