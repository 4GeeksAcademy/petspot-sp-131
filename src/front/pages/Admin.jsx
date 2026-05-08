import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate,useParams } from "react-router-dom";

export const Admin = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("tokenAdmin");
    setIsLogged(!!token);

    const loginMessage = sessionStorage.getItem("adminLoginSuccess");
    if (loginMessage) {
      setSuccessMessage(loginMessage);
      sessionStorage.removeItem("adminLoginSuccess");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("tokenAdmin");
    setIsLogged(false);
    navigate("/usuario/admin/login");
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3" style={{ borderColor: "var(--admin-border)" }}>
        <div>
          <h1 className="display-5 fw-bold mb-0" style={{ color: "var(--admin-text)" }}>Admin Panel</h1>
          <p className="mb-0" style={{ color: "var(--admin-text-muted)" }}>Manage the entire PetSpot ecosystem from here.</p>
        </div>

        {!isLogged ? (
          <Link to="/usuario/admin/login" className="btn btn-success px-4 rounded-pill">
            <i className="fa-solid fa-right-to-bracket me-2"></i>Login
          </Link>
        ) : (
          <button className="btn btn-outline-danger px-4 rounded-pill" onClick={handleLogout}>
            <i className="fa-solid fa-power-off me-2"></i>Logout
          </button>
        )}
      </div>

{successMessage && (
        <div className="alert alert-success shadow-sm border-0">{successMessage}</div>
      )}

      <Outlet />
    </div>
  );
};
export const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAdmins(data);
        setMessage("");
      } else {
        setMessage(data.msg || "Error al cargar admins");
      }
    } catch (error) {
      console.error("Error al cargar admins:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/admin/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
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

      <div className="row">
        {admins.length === 0 ? (
          <div className="col-12 text-center mt-3">
            <p className="lead">No hay admins registrados</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div className="col-md-4 mb-4" key={admin.id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="card-title mb-0">Admin #{admin.id}</h5>
                </div>
                <div className="card-body">
                  <p className="card-text mb-2"><strong>Nombre:</strong> {admin.name}</p>
                  <p className="card-text"><strong>Email:</strong> {admin.email}</p>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                  <Link to={`/usuario/admin/detalle/${admin.id}`} className="btn btn-info btn-sm text-white">
                    Ver perfil
                  </Link>
                  <Link to={`/usuario/admin/editar/${admin.id}`} className="btn btn-primary btn-sm">
                    Editar
                  </Link>
                  <Link to={`/usuario/admin/eliminar/${admin.id}`} className="btn btn-danger btn-sm">
                    Eliminar
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
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
          headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        },
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
          headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
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
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        },
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

// ========= COMPONENTE: DETALLE ADMIN =========
export const AdminDetail = () => {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/admin/${id}`, {
          method: "GET",
          headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
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

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando admin...</p></div>;
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
        <div className="card-header bg-info text-white">
          <h3>Perfil de Administrador</h3>
        </div>
        <div className="card-body">
          <p className="fs-5"><strong>ID:</strong> {admin.id}</p>
          <p className="fs-5"><strong>Nombre:</strong> {admin.name}</p>
          <p className="fs-5"><strong>Email:</strong> {admin.email}</p>
        </div>
        <div className="card-footer">
          <Link to="/usuario/admin" className="btn btn-secondary">
            Volver al listado
          </Link>
        </div>
      </div>
    </div>
  );
};


