import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
                    navigate("/login/user");
                } else {
                    setError(data.msg || "Error al registrar usuario");
                }
            })
            .catch(() => {
                setError("Error de conexión con el servidor");
            });
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create account</h1>
                <p className="auth-subtitle">Register to access your private area</p>

                <form className="auth-form" onSubmit={sendData} noValidate>

                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError("");
                            }}
                            type="text"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
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
                        <label className="form-label">Password</label>
                        <input
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                            type="password"
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            placeholder="Create a password"
                        />
                    </div>

                    {error && (
                        <div className="invalid-feedback d-block text-start mb-3">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary auth-btn">
                        Register
                    </button>
                </form>

                <p className="auth-link">
                    ¿Ya tienes cuenta? <Link to="/login/user">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};