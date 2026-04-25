import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const UserPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("tokenUser");
    if (!token) {
        navigate("/login/user");
        return;
    }
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/users/pets`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPets(data);
        setMessage("");
      } else {
        setMessage(data.msg || "Error al cargar tus mascotas");
      }
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta mascota?")) return;
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pets/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        }
      });
      if (response.ok) {
        fetchPets(); // Recargar lista
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Error al eliminar la mascota");
      }
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      alert("Error al conectar con el servidor");
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando tus mascotas...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mis Mascotas</h1>
        <div>
          <Link to="/private/user/pets/add" className="btn btn-success me-2">
            + Añadir Mascota
          </Link>
          <Link to="/private/user" className="btn btn-secondary">
            Volver a Mi Perfil
          </Link>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">
        {pets.length === 0 ? (
          <div className="col-12 text-center mt-3">
            <p className="lead">Todavía no has registrado ninguna mascota.</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div className="col-md-4 mb-4" key={pet.id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">{pet.name}</h5>
                </div>
                {(pet.url || pet.breed_url) && (
                  <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: "220px", overflow: "hidden" }}>
                    <img src={pet.url || pet.breed_url} alt={pet.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                  </div>
                )}
                <div className="card-body">
                  <p className="card-text mb-2"><strong>Tipo:</strong> {pet.animal_type}</p>
                  <p className="card-text mb-2"><strong>Raza:</strong> {pet.breed_name || "Mestizo / Sin especificar"}</p>
                  <p className="card-text"><strong>Tamaño:</strong> {pet.size}</p>
                </div>
                <div className="card-footer bg-transparent d-flex justify-content-end">
                  <Link to={`/private/user/pets/edit/${pet.id}`} className="btn btn-sm btn-outline-primary me-2">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(pet.id)} className="btn btn-sm btn-danger">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserPets;

