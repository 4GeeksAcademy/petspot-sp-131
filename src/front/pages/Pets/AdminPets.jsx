import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pets`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPets(data);
        setMessage("");
      } else {
        setMessage(data.msg || "Error al cargar mascotas");
      }
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando mascotas...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Todas las Mascotas</h1>
        <Link to="/usuario/admin" className="btn btn-secondary">
          Volver a Panel Admin
        </Link>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">
        {pets.length === 0 ? (
          <div className="col-12 text-center mt-3">
            <p className="lead">No hay mascotas registradas en el sistema</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div className="col-md-4 mb-4" key={pet.id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-dark text-white">
                  <h5 className="card-title mb-0">{pet.name}</h5>
                </div>
                <div className="card-body">
                  <p className="card-text mb-2"><strong>ID Dueño:</strong> {pet.user_id}</p>
                  <p className="card-text mb-2"><strong>Tipo:</strong> {pet.animal_type}</p>
                  <p className="card-text mb-2"><strong>Raza:</strong> {pet.race_name || "Desconocida/Mestizo"}</p>
                  <p className="card-text"><strong>Tamaño:</strong> {pet.size}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPets;
