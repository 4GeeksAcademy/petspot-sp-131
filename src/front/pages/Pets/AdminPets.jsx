import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_IMAGES = {
  dog:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=60",
  cat:   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60",
  other: "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=400&auto=format&fit=crop",
};

const AdminPets = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const adminToken = localStorage.getItem("tokenAdmin");

  const animalTypeLabel = { dog: "Dog", cat: "Cat", other: "Other" };
  const sizeLabel = { small: "Small", medium: "Medium", large: "Large" };

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/pets`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPets(data);
        setMessage("");
      } else {
        setMessage(data.msg || "Error loading pets");
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      setMessage("Error connecting to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId, petName) => {
    if (!window.confirm(`Delete "${petName}"? This cannot be undone.`)) return;
    setDeletingId(petId);
    try {
      const res = await fetch(`${backendUrl}/api/admin/pets/${petId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setPets((prev) => prev.filter((p) => p.id !== petId));
      } else {
        const data = await res.json();
        alert(data.msg || "Could not delete pet");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error connecting to the server");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Loading pets...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>All Pets</h1>
        <Link to="/usuario/admin" className="btn btn-secondary">
          Back to Admin Dashboard
        </Link>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">
        {pets.length === 0 ? (
          <div className="col-12 text-center mt-3">
            <p className="lead">There are no pets registered in the system.</p>
          </div>
        ) : (
          pets.map((pet) => {
            const imageUrl = pet.url || pet.race_url || FALLBACK_IMAGES[pet.animal_type] || FALLBACK_IMAGES.other;

            return (
              <div className="col-md-4 mb-4" key={pet.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{pet.name}</h5>
                    <span className="badge bg-secondary">ID {pet.id}</span>
                  </div>

                  <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: "220px", overflow: "hidden" }}>
                    <img
                      src={imageUrl}
                      alt={pet.name}
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      onError={(e) => { e.target.src = FALLBACK_IMAGES[pet.animal_type] || FALLBACK_IMAGES.other; }}
                    />
                  </div>

                  <div className="card-body">
                    <p className="card-text mb-2"><strong>Owner ID:</strong> {pet.user_id}</p>
                    <p className="card-text mb-2">
                      <strong>Type:</strong>{" "}
                      {pet.animal_type === "other"
                        ? (pet.other_type || animalTypeLabel.other)
                        : animalTypeLabel[pet.animal_type]}
                    </p>
                    <p className="card-text mb-2"><strong>Breed:</strong> {pet.race_name || "Unknown / Mixed"}</p>
                    <p className="card-text mb-3"><strong>Size:</strong> {sizeLabel[pet.size] || pet.size}</p>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/usuario/admin/pets/edit/${pet.id}`}
                        className="btn btn-primary btn-sm flex-fill"
                      >
                        <i className="fa-solid fa-pen me-1" />
                        Edit
                      </Link>
                      <button
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => handleDelete(pet.id, pet.name)}
                        disabled={deletingId === pet.id}
                      >
                        {deletingId === pet.id
                          ? <span className="spinner-border spinner-border-sm" />
                          : <><i className="fa-solid fa-trash me-1" />Delete</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminPets;
