import React, { useState, useEffect } from "react";

export const Admin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [admins, setAdmins] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Cargar la lista de admins al montar el componente
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Error al cargar admins:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Admin creado correctamente");
        setFormData({
          name: "",
          email: "",
          password: ""
        });
        fetchAdmins(); // Recargar la lista
      } else {
        setMessage(data.error || "Error al crear admin");
      }
    } catch (error) {
      setMessage("No se pudo conectar con el backend");
    }
  };

  const handleEdit = (admin) => {
    setEditing(true);
    setEditingId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: ""
    });
    setMessage("");
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const updateData = {
        name: formData.name,
        email: formData.email
      };
      // Solo incluir password si no está vacío
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${backendUrl}/api/admin/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Admin actualizado correctamente");
        setFormData({
          name: "",
          email: "",
          password: ""
        });
        setEditing(false);
        setEditingId(null);
        fetchAdmins(); // Recargar la lista
      } else {
        setMessage(data.error || "Error al actualizar admin");
      }
    } catch (error) {
      setMessage("No se pudo conectar con el backend");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este admin?")) {
      return;
    }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Admin eliminado correctamente");
        fetchAdmins(); // Recargar la lista
      } else {
        setMessage(data.error || "Error al eliminar admin");
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
      password: ""
    });
    setMessage("");
  };

  return (
    <div className="container">
      <h1 className="text-center my-4">
        {editing ? "Editar Admin" : "Crear Admin"}
      </h1>

      {/* Formulario de creación/edición */}
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
            placeholder="Nombre del admin"
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
            placeholder="Email del admin"
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
            placeholder={
              editing ? "Dejar vacío para mantener el actual" : "Password"
            }
            required={!editing}
          />
        </div>

        <div className="col-12 text-center">
          {editing ? (
            <>
              <button
                type="submit"
                className="btn btn-warning me-2"
              >
                Actualizar Admin
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
              Crear admin
            </button>
          )}
        </div>
      </form>

      {message && <p className="text-center mt-3">{message}</p>}

      {/* Tabla de admins */}
      <div className="row mt-5">
        <h3 className="text-center">Lista de Admins</h3>
        {admins.length === 0 ? (
          <p className="text-center">No hay admins registrados aún.</p>
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
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEdit(admin)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(admin.id)}
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