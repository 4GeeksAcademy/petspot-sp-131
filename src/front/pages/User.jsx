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
    <div className="container">
      <h1 className="text-center my-4">Users</h1>

      {message && <p className="text-center mt-3">{message}</p>}

      {/* BOTÓN CREAR */}
      <div className="text-center mb-4">
        <Link to="/user/create" className="btn btn-success">
          Crear usuario
        </Link>
      </div>

      {/* LISTA */}
      <table className="table">
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
                    className="btn btn-info btn-sm me-2"
                  >
                    Ver
                  </Link>

                  <Link
                    to={`/user/edit/${user.id}`}
                    className="btn btn-warning btn-sm me-2"
                  >
                    Editar
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
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