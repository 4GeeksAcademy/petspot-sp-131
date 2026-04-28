import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminPets, deletePetAdmin } from "../../services/adminService";

const OTHER_PET_FALLBACK_IMAGE = "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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
      setLoading(true);
      const data = await getAdminPets();
      setPets(data);
      setMessage("");
    } catch (error) {
      console.error("Error loading pets:", error);
      setMessage("Error loading pets from the server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    
    try {
      await deletePetAdmin(petId);
      setPets(pets.filter(p => p.id !== petId));
      setMessage("Pet deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      alert("Error deleting pet");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5 pt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-dark">Pet Management</h1>
        <Link to="/usuario/admin" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="fa-solid fa-arrow-left me-2"></i>Dashboard
        </Link>
      </div>

      {message && (
        <div className="alert alert-success border-0 shadow-sm rounded-3 d-flex align-items-center" role="alert">
          <i className="fa-solid fa-circle-check me-2"></i>
          <div>{message}</div>
        </div>
      )}

      <div className="row g-4">
        {pets.length === 0 ? (
          <div className="col-12 text-center py-5 bg-light rounded-4 border border-dashed">
            <i className="fa-solid fa-paw fa-3x text-muted mb-3"></i>
            <p className="lead text-muted">No pets registered in the system yet.</p>
          </div>
        ) : (
          pets.map((pet) => {
            const imageUrl = pet.url || pet.race_url || (pet.animal_type === "other" ? OTHER_PET_FALLBACK_IMAGE : null);

            return (
              <div className="col-md-6 col-lg-4" key={pet.id}>
                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all rounded-4 overflow-hidden">
                  <div className="position-relative">
                    {imageUrl && (
                      <div className="bg-light" style={{ height: "200px" }}>
                        <img 
                          src={imageUrl} 
                          alt={pet.name} 
                          className="w-100 h-100 object-fit-cover" 
                        />
                      </div>
                    )}
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-dark rounded-pill shadow-sm">ID: {pet.id}</span>
                    </div>
                  </div>
                  
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: '70%' }}>{pet.name}</h5>
                      <span className={`badge rounded-pill ${pet.animal_type === 'dog' ? 'bg-primary' : pet.animal_type === 'cat' ? 'bg-info' : 'bg-warning text-dark'}`}>
                        {animalTypeLabel[pet.animal_type] || pet.animal_type}
                      </span>
                    </div>
                    
                    <div className="small text-muted mb-3">
                      <div className="d-flex align-items-center mb-1">
                        <i className="fa-solid fa-user-tag me-2 opacity-50"></i>
                        <span>Owner: User #{pet.user_id}</span>
                      </div>
                      <div className="d-flex align-items-center mb-1">
                        <i className="fa-solid fa-dna me-2 opacity-50"></i>
                        <span>{pet.race_name || (pet.other_type ? pet.other_type : "Mixed Breed")}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fa-solid fa-up-right-and-down-left-from-center me-2 opacity-50"></i>
                        <span>Size: {sizeLabel[pet.size] || pet.size}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 mt-auto">
                      <Link 
                        to={`/usuario/admin/pets/edit/${pet.id}`} 
                        className="btn btn-light flex-grow-1 btn-sm fw-bold rounded-3 py-2"
                      >
                        <i className="fa-solid fa-pen-to-square me-2"></i>Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(pet.id)} 
                        className="btn btn-outline-danger btn-sm rounded-3 px-3"
                      >
                        <i className="fa-solid fa-trash-can"></i>
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

