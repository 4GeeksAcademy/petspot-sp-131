import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const UserCreate = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        is_active: true
    });

    const [message, setMessage] = useState("");
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Usuario creado correctamente");

                setTimeout(() => {
                    navigate("/user");
                }, 1000);
            } else {
                setMessage(data.msg || "Error al crear usuario");
            }
        } catch (error) {
            setMessage("No se pudo conectar con el backend");
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Crear Usuario</h1>

            {message && (
                <div className="alert alert-danger">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-success">
                    Crear Usuario
                </button>

                <Link to="/user" className="btn btn-secondary ms-2">
                    Volver al listado
                </Link>
            </form>
        </div>
    );
};