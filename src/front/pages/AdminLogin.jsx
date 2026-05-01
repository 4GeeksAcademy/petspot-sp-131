import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


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
    <div className="admin-login-container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '450px', width: '100%', overflow: 'hidden' }}>
        <div className="card-header border-0 text-center py-4 text-white" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
          <h2 className="mb-0 fw-bold">Admin Portal</h2>
          <p className="mb-0 text-white-50 small mt-1">PetSpot Management</p>
        </div>
        
        <div className="card-body p-5">
          {message && (
            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-4" role="alert">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              <div>{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingEmail"><i className="fa-solid fa-envelope me-2 text-muted"></i>Email Address</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingPassword"><i className="fa-solid fa-lock me-2 text-muted"></i>Password</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold text-uppercase"
              style={{ transition: 'all 0.3s', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', border: 'none' }}
              disabled={submitting}
            >
              {submitting ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...</span>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </div>
        
        <div className="card-footer text-center py-3 bg-white border-0">
          <small className="text-muted">Secure Access Only</small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;