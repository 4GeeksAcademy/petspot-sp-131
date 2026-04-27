import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const OTHER_PET_FALLBACK_IMAGE = "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const EditPet = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    animal_type: "dog",
    other_type: "",
    race_id: "",
    size: "medium",
    url: ""
  });
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const previewImage = imageFile
    ? null
    : formData.url || (formData.animal_type === "other" ? OTHER_PET_FALLBACK_IMAGE : null);

  useEffect(() => {
    const token = localStorage.getItem("tokenUser");
    if (!token) {
      navigate("/login/user");
      return;
    }
    fetchRaces();
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pets/${id}`);
      if (response.ok) {
        const data = await response.json();
        const isCustomType = data.animal_type === "other";

        setFormData({
          name: data.name,
          animal_type: data.animal_type,
          other_type: isCustomType ? (data.other_type || "") : "",
          race_id: data.race_id || "",
          size: data.size,
          url: data.url || ""
        });
      } else {
        setMessage("Could not load the pet.");
      }
    } catch (error) {
      console.error("Error loading pet:", error);
      setMessage("Error loading pet.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRaces = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/races`);
      const data = await response.json();
      if (response.ok) {
        setRaces(data);
      }
    } catch (error) {
      console.error("Error loading races:", error);
    }
  };

  useEffect(() => {
    if (races.length > 0 && (formData.animal_type === "dog" || formData.animal_type === "cat")) {
      const raceType = formData.animal_type === "dog" ? "perro" : "gato";
      setFilteredRaces(races.filter((race) => race.animal_type.toLowerCase() === raceType));
    }
  }, [races, formData.animal_type]);

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
    setMessage("");

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

    let imageUrl = formData.url;
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
      const response = await fetch(`${backendUrl}/api/pets/${id}`, {
        method: "PUT",
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
        setMessage(errorData.msg || "Error updating the pet");
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      setMessage("Error connecting to the server");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Loading pet data...</p></div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Edit Pet</h3>
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
                  <label className="form-label">Pet Photo</label>
                  {previewImage && (
                    <div className="mb-2">
                      <img src={previewImage} alt="Pet preview" className="img-thumbnail" style={{ height: "100px" }} />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">Upload a new photo if you want to replace the current one (optional).</small>
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
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Changes"}
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

export default EditPet;
