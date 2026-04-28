import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updatePetAdmin } from "../../services/adminService";
import { getPetById, getRaces } from "../../services/userPrivateService";

const AdminPetForm = ({ petId, mode = "edit" }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        animal_type: "dog",
        race_id: "",
        size: "medium",
        url: ""
    });
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const racesData = await getRaces();
                setRaces(racesData);

                if (mode === "edit" && petId) {
                    const pet = await getPetById(petId);
                    setFormData({
                        name: pet.name || "",
                        animal_type: pet.animal_type || "dog",
                        race_id: pet.race_id || "",
                        size: pet.size || "medium",
                        url: pet.url || ""
                    });
                }
            } catch (error) {
                console.error("Error loading form data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [petId, mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updatePetAdmin(petId, formData);
            alert("Pet updated successfully");
            navigate("/usuario/admin/pets");
        } catch (error) {
            alert("Error updating pet");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;

    return (
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="form-label fw-bold small text-uppercase text-muted">Pet Name</label>
                    <input 
                        type="text" 
                        className="form-control form-control-lg border-0 bg-light rounded-3" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-uppercase text-muted">Animal Type</label>
                        <select 
                            className="form-select border-0 bg-light rounded-3"
                            value={formData.animal_type}
                            onChange={(e) => setFormData({...formData, animal_type: e.target.value})}
                        >
                            <option value="dog">Dog</option>
                            <option value="cat">Cat</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold small text-uppercase text-muted">Size</label>
                        <select 
                            className="form-select border-0 bg-light rounded-3"
                            value={formData.size}
                            onChange={(e) => setFormData({...formData, size: e.target.value})}
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold small text-uppercase text-muted">Image URL</label>
                    <input 
                        type="text" 
                        className="form-control border-0 bg-light rounded-3" 
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        placeholder="https://..."
                    />
                </div>

                <div className="d-grid mt-5">
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm py-3"
                        disabled={submitting}
                    >
                        {submitting ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPetForm;
