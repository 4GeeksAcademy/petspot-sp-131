import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/";

const AdminLoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${backendUrl}api/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || data.error || "Login failed");
                setLoading(false);
                return;
            }

            // Guardar admin en localStorage
            localStorage.setItem("admin", JSON.stringify(data));
            localStorage.setItem("isAdminLoggedIn", "true");

            navigate("/admin/dashboard");
        } catch (err) {
            setError("Error connecting to server. Please try again.");
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("isAdminLoggedIn");
        navigate("/admin/login");
    };

    // Verificar si ya está logueado
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

    if (isLoggedIn) {
        return (
            <div className="text-center">
                <p className="text-success mb-2">You are logged in as Admin</p>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="card p-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h3 className="text-center mb-3">Admin Login</h3>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default AdminLoginForm;
