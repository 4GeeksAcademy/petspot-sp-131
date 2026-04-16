import React, { useEffect, useState } from "react";

export const User = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        is_active: true
    });

    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [editing, setEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users`);
            const data = await response.json();

            if (response.ok) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setMessage("No se pudo cargar la lista de usuarios");
        }
    };

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
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    is_active: true
                });
                fetchUsers();
            } else {
                setMessage(data.msg || "Error al crear usuario");
            }
        } catch (error) {
            setMessage("No se pudo conectar con el backend");
        }
    };

    const handleEdit = (user) => {
        setEditing(true);
        setEditingId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            is_active: true
        });
        setMessage("");
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const updateData = {
                name: formData.name,
                email: formData.email,
                is_active: formData.is_active
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await fetch(`${backendUrl}/api/users/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Usuario actualizado correctamente");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    is_active: true
                });
                setEditing(false);
                setEditingId(null);
                fetchUsers();
            } else {
                setMessage(data.msg || "Error al actualizar usuario");
            }
        } catch (error) {
            setMessage("No se pudo conectar con el backend");
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setMessage("");
    };

    const confirmDelete = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/${userToDelete.id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Usuario eliminado correctamente");
                setUserToDelete(null);
                fetchUsers();
            } else {
                setMessage(data.msg || "Error al eliminar usuario");
            }
        } catch (error) {
            setMessage("No se pudo conectar con el backend");
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditingId(null);
        setFormData({
            name: "",
            email: "",
            password: "",
            is_active: true
        });
        setMessage("");
    };

    return (
        <div className="container">
            <h1 className="text-center my-4">
                {editing ? "Editar Usuario" : "Crear Usuario"}
            </h1>

            <form
                onSubmit={editing ? handleUpdateSubmit : handleSubmit}
                className="row g-3 justify-content-center"
            >
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
                        placeholder={editing ? "Dejar vacío para mantener el actual" : "Password"}
                        required={!editing}
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
                    {editing ? (
                        <>
                            <button type="submit" className="btn btn-warning me-2">
                                Actualizar Usuario
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancelEdit}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <button type="submit" className="btn btn-success">
                            Crear Usuario
                        </button>
                    )}
                </div>
            </form>

            {message && <p className="text-center mt-3">{message}</p>}

            {userToDelete && (
                <div className="alert alert-danger text-center mt-3">
                    <p>¿Seguro que quieres eliminar a {userToDelete.name}?</p>
                    <button className="btn btn-danger me-2" onClick={confirmDelete}>
                        Sí, eliminar
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setUserToDelete(null)}
                    >
                        Cancelar
                    </button>
                </div>
            )}

            <div className="row mt-5">
                <h3 className="text-center">Lista de Usuarios</h3>

                {users.length === 0 ? (
                    <p className="text-center">No hay usuarios registrados aún.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};