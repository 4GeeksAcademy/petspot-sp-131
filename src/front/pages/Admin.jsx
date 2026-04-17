import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, Outlet } from "react-router-dom";

// ========= COMPONENTE: LISTADO DE ADMINS =========
export const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error al cargar los admins");
      }
    } catch (error) {
      console.error("Error al cargar admins:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        setMessage("Admin eliminado exitosamente");
        fetchAdmins();
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error al eliminar admin");
      }
    } catch (error) {
      console.error("Error al eliminar admin:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando admins...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Administradores</h1>

      {message && <div className="alert alert-info">{message}</div>}

      <Link to="/usuario/admin/crear" className="btn btn-success mb-3">
        + Crear Admin
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
          {admins.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No hay admins registrados</td>
            </tr>
          ) : (
            admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>
                  <Link to={`/usuario/admin/editar/${admin.id}`} className="btn btn-primary me-2">
                    Editar
                  </Link>
                  <Link to={`/usuario/admin/eliminar/${admin.id}`} className="btn btn-danger">
                    Eliminar
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ========= COMPONENTE: EDITAR ADMIN =========
export const AdminEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/admin/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setAdmin(data);
        } else {
          setMessage("Error al cargar datos del admin");
        }
      } catch (error) {
        console.error("Error al cargar admin:", error);
        setMessage("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin({ ...admin, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const dataToSend = { ...admin };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      const response = await fetch(`${backendUrl}/api/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      if (response.ok) {
        setMessage("Admin actualizado exitosamente");
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error al actualizar admin");
      }
    } catch (error) {
      console.error("Error al actualizar admin:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando...</p></div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Editar Admin</h1>

      {message && <div className={`alert ${message.includes("exitosamente") ? "alert-success" : "alert-danger"}`}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={admin.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={admin.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password (dejar vacio para no cambiar)</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={admin.password}
            onChange={handleInputChange}
            placeholder="Nueva contrasena"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar Cambios"}
        </button>
        <Link to="/usuario/admin" className="btn btn-secondary ms-2">
          Volver al listado
        </Link>
      </form>
    </div>
  );
};

// ========= COMPONENTE: ELIMINAR ADMIN (VISTA DE CONFIRMACION) =========
export const AdminDelete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/admin/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setAdmin(data);
        } else {
          setMessage("No se pudo encontrar el admin");
        }
      } catch (error) {
        console.error("Error al cargar admin:", error);
        setMessage("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [id]);

  const handleConfirmDelete = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        navigate("/usuario/admin");
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error al eliminar admin");
      }
    } catch (error) {
      console.error("Error al eliminar admin:", error);
      setMessage("Error al conectar con el servidor");
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando...</p></div>;
  }

  if (message && !admin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{message}</div>
        <Link to="/usuario/admin" className="btn btn-secondary">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-danger text-white">
          <h3>Eliminar Admin</h3>
        </div>
        <div className="card-body">
          <p>¿Estás seguro de que quieres eliminar este administrador?</p>
          <div className="alert alert-warning">
            <strong>ID:</strong> {admin.id}<br />
            <strong>Nombre:</strong> {admin.name}<br />
            <strong>Email:</strong> {admin.email}
          </div>
          <p className="text-danger">
            <strong>Esta accion no se puede deshacer.</strong>
          </p>
        </div>
        <div className="card-footer text-center">
          <button
            onClick={handleConfirmDelete}
            className="btn btn-danger me-2"
          >
            Si, eliminar
          </button>
          <Link to="/usuario/admin" className="btn btn-secondary">
            Cancelar y volver
          </Link>
        </div>
      </div>

      {message && <p className="text-center mt-3">{message}</p>}
    </div>
  );
};

// ========= COMPONENTE: CREAR ADMIN (VISTA DE CREACION) =========
export const AdminCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        navigate("/usuario/admin");
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error al crear admin");
      }
    } catch (error) {
      console.error("Error al crear admin:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Crear Admin</h1>

      {message && <div className="alert alert-danger">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? "Creando..." : "Crear Admin"}
        </button>
        <Link to="/usuario/admin" className="btn btn-secondary ms-2">
          Volver al listado
        </Link>
      </form>
    </div>
  );
};

// ========= COMPONENTE PRINCIPAL: ADMIN (CONTENEDOR DE RUTAS) =========
export const Admin = () => {
  return <Outlet />;
};