import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGES = {
  dog:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=60",
  cat:   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60",
  other: "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=400&auto=format&fit=crop",
};

const AdminPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const animalTypeLabel = {
    dog: "Dog",
    cat: "Cat",
    other: "Other"
  };

  const sizeLabel = {
    small: "Small",
    medium: "Medium",
    large: "Large"
  };

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
        setMessage(data.msg || "Error loading pets");
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      setMessage("Error connecting to the server");
    } finally {
      setLoading(false);
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
                  <div className="card-header bg-dark text-white">
                    <h5 className="card-title mb-0">{pet.name}</h5>
                  </div>
                  {imageUrl && (
                    <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: "220px", overflow: "hidden" }}>
                      <img src={imageUrl} alt={pet.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                  <div className="card-body">
                    <p className="card-text mb-2"><strong>Owner ID:</strong> {pet.user_id}</p>
                    <p className="card-text mb-2"><strong>Type:</strong> {pet.animal_type === "other" ? (pet.other_type || animalTypeLabel.other) : animalTypeLabel[pet.animal_type]}</p>
                    <p className="card-text mb-2"><strong>Race:</strong> {pet.race_name || "Unknown / Mixed"}</p>
                    <p className="card-text"><strong>Size:</strong> {sizeLabel[pet.size] || pet.size}</p>
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
