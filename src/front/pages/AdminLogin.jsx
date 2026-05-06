import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/img/Logo_PetSpot.svg";

export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/usuario/admin";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("tokenAdmin", data.token);
        sessionStorage.setItem("adminLoginSuccess", "Login realizado correctamente");
        navigate(from, { replace: true });
      } else {
        setMessage(data.msg || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">

        <div className="admin-auth-logo">
          <img src={logo} alt="PetSpot logo" />
          <span>Admin</span>
        </div>

        <h4>Hello! let's get started</h4>
        <p className="admin-auth-subtitle">Sign in to continue.</p>

        {message && (
          <div className="alert alert-danger rounded-3 mb-4" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              className="form-control admin-auth-input"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="form-control admin-auth-input"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="admin-auth-btn" disabled={submitting}>
            {submitting ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="admin-auth-options">
          <label>
            <input type="checkbox" />
            <span>Keep me signed in</span>
          </label>

          <span>Forgot password?</span>
        </div>

        <p className="admin-auth-footer">Secure Access Only</p>
      </div>
    </div>
  );
};

export default AdminLogin;