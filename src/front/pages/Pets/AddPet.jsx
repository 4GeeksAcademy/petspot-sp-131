import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddPet = () => {
  const [formData, setFormData] = useState({
    name: "",
    animal_type: "dog",
    other_type: "",
    race_id: "",
    size: "medium"
  });
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("tokenUser");
    if (!token) {
      navigate("/login/user");
      return;
    }
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/races`);
      const data = await response.json();
      if (response.ok) {
        setRaces(data);
        setFilteredRaces(data.filter((race) => race.animal_type.toLowerCase() === "perro"));
      }
    } catch (error) {
      console.error("Error loading races:", error);
    }
  };

  const handleImportRaces = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/races/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.msg || "Races imported successfully");
        fetchRaces();
      } else {
        alert("Error importing races: " + data.msg);
      }
    } catch (error) {
      console.error("Error importing races:", error);
      alert("Error connecting to the server");
    }
  };

  const handleAnimalTypeChange = (event) => {
    const type = event.target.value;
    setFormData({ ...formData, animal_type: type, race_id: "", other_type: "" });

    if (type === "dog" || type === "cat") {
      const raceType = type === "dog" ? "perro" : "gato";
      setFilteredRaces(races.filter((race) => race.animal_type.toLowerCase() === raceType));
    } else {
      setFilteredRaces([]);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const uploadData = new FormData();
    uploadData.append("image", imageFile);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        },
        body: uploadData
      });
      const data = await response.json();
      if (response.ok) {
        return data.url;
      }
      throw new Error(data.msg || "Error uploading image");
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    if (formData.animal_type === "other" && !formData.other_type.trim()) {
      setMessage("Please specify the animal type.");
      setSubmitting(false);
      return;
    }

    if ((formData.animal_type === "dog" || formData.animal_type === "cat") && !formData.race_id) {
      setMessage("Please select a race.");
      setSubmitting(false);
      return;
    }

    let imageUrl = null;
    try {
      if (imageFile) {
        imageUrl = await uploadImage();
      }
    } catch (error) {
      setMessage("Error uploading the image. Please try again.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name,
      animal_type: formData.animal_type,
      other_type: formData.animal_type === "other" ? formData.other_type.trim() : null,
      size: formData.size,
      race_id: formData.race_id || null,
      url: imageUrl
    };

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        navigate("/private/user/pets");
      } else {
        const errorData = await response.json();
        setMessage(errorData.msg || "Error creating the pet");
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      setMessage("Error connecting to the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Add New Pet</h3>
            </div>
            <div className="card-body">
              {message && <div className="alert alert-danger">{message}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Pet Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex. Rex, Fluffy..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Pet Photo (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Animal Type</label>
                  <select
                    className="form-select"
                    name="animal_type"
                    value={formData.animal_type}
                    onChange={handleAnimalTypeChange}
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.animal_type === "other" && (
                  <div className="mb-3">
                    <label className="form-label">Specify Animal Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="other_type"
                      value={formData.other_type}
                      onChange={handleInputChange}
                      placeholder="Ex. Parrot, Ferret, Rabbit..."
                      required
                    />
                  </div>
                )}

                {(formData.animal_type === "dog" || formData.animal_type === "cat") && (
                  <div className="mb-3">
                    <label className="form-label d-flex justify-content-between align-items-center">
                      Race
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleImportRaces}
                      >
                        Import Races
                      </button>
                    </label>
                    <select
                      className="form-select"
                      name="race_id"
                      value={formData.race_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select a race --</option>
                      {filteredRaces.map((race) => (
                        <option key={race.id} value={race.id}>{race.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Size</label>
                  <select
                    className="form-select"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Link to="/private/user/pets" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Pet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPet;
