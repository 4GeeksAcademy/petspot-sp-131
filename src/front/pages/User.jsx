import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const User = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("")

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/users`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/api/users/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setMessage("Usuario eliminado correctamente");
        setTimeout(() => {
          setMessage("");
        }, 2000);
        fetchUsers();
      }

    } catch (error) {
      setMessage("Error al eliminar usuario");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Usuarios</h1>

      {message && <div className="alert alert-info">{message}</div>}

      <Link to="/user/create" className="btn btn-success mb-3">
        + Crear Usuario
      </Link>

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
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay usuarios registrados
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <Link
                    to={`/user/detail/${user.id}`}
                    className="btn btn-info me-2"
                  >
                    Ver
                  </Link>

                  <Link
                    to={`/user/edit/${user.id}`}
                    className="btn btn-primary me-2"
                  >
                    Editar
                  </Link>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};