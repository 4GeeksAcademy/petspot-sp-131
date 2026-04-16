import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <div className="container">
            <h1 className="text-center my-4">Crear Usuario</h1>

            <form onSubmit={handleSubmit} className="row g-3 justify-content-center">
                <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nombre del usuario"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email del usuario"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label d-block">Activo</label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-12 text-center">
                    <button type="submit" className="btn btn-success">
                        Crear Usuario
                    </button>
                </div>
            </form>

            {message && <p className="text-center mt-3">{message}</p>}
        </div>
    );
};