import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    const fetchUser = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/${id}`);
            const data = await response.json();

            if (response.ok) {
                setUser(data);
            } else {
                setMessage(data.msg || "Usuario no encontrado");
            }
        } catch (error) {
            setMessage("No se pudo conectar con el backend");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Detalle de Usuario</h1>

            {message && <p className="text-center">{message}</p>}

            {user && (
                <div className="card p-4">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            )}

            <div className="text-center mt-4">
                <Link to="/user" className="btn btn-secondary">
                    Volver
                </Link>
            </div>
        </div>
    );
};