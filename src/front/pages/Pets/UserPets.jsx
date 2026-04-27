import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const OTHER_PET_FALLBACK_IMAGE = "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const UserPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
        setMessage(data.msg || "Error loading your pets");
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      setMessage("Error connecting to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;

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
        fetchPets();
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Error deleting the pet");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      alert("Error connecting to the server");
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Loading your pets...</p></div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Pets</h1>
        <div>
          <Link to="/private/user/pets/add" className="btn btn-success me-2">
            + Add Pet
          </Link>
          <Link to="/private/user" className="btn btn-secondary">
            Back to My Profile
          </Link>
        </div>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="row">
        {pets.length === 0 ? (
          <div className="col-12 text-center mt-3">
            <p className="lead">You have not added any pets yet.</p>
          </div>
        ) : (
          pets.map((pet) => {
            const imageUrl = pet.url || pet.race_url || (pet.animal_type === "other" ? OTHER_PET_FALLBACK_IMAGE : null);

            return (
              <div className="col-md-4 mb-4" key={pet.id}>
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">{pet.name}</h5>
                  </div>
                  {imageUrl && (
                    <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: "220px", overflow: "hidden" }}>
                      <img src={imageUrl} alt={pet.name} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                  <div className="card-body">
                    <p className="card-text mb-2"><strong>Type:</strong> {pet.animal_type === "other" ? (pet.other_type || animalTypeLabel.other) : animalTypeLabel[pet.animal_type]}</p>
                    <p className="card-text mb-2"><strong>Race:</strong> {pet.race_name || "Mixed / Unspecified"}</p>
                    <p className="card-text"><strong>Size:</strong> {sizeLabel[pet.size] || pet.size}</p>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-end">
                    <Link to={`/private/user/pets/edit/${pet.id}`} className="btn btn-sm btn-outline-primary me-2">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(pet.id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
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

export default UserPets;
