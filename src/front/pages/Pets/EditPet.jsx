import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const EditPet = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    animal_type: "Perro",
    custom_animal_type: "",
    breed_id: "",
    size: "",
    url: ""
  });
  const [breeds, setBreeds] = useState([]);
  const [filteredBreeds, setfilteredBreeds] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("tokenUser");
    if (!token) {
        navigate("/login/user");
        return;
    }
    fetchBreeds();
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/pets/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        let isCustomType = data.animal_type !== "Perro" && data.animal_type !== "Gato";
        
        setFormData({
          name: data.name,
          animal_type: isCustomType ? "Otros" : data.animal_type,
          custom_animal_type: isCustomType ? data.animal_type : "",
          breed_id: data.breed_id || "",
          size: data.size,
          url: data.url || ""
        });
      } else {
        setMessage("No se pudo cargar la mascota");
      }
    } catch (error) {
      console.error("Error al cargar mascota:", error);
      setMessage("Error al cargar mascota");
    } finally {
      setLoading(false);
    }
  };

  const fetchBreeds = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}api/breeds`);
      const data = await response.json();
      if (response.ok) {
        setBreeds(data);
        // We will update filtered breeds based on fetched pet type after both fetch
      }
    } catch (error) {
      console.error("Error al cargar razas:", error);
    }
  };

  useEffect(() => {
    if (breeds.length > 0 && (formData.animal_type === "Perro" || formData.animal_type === "Gato")) {
      setfilteredBreeds(breeds.filter(r => r.animal_type.toLowerCase() === formData.animal_type.toLowerCase()));
    }
  }, [breeds, formData.animal_type]);

  const handleImportBreeds = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${backendUrl}api/breeds/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("tokenUser")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.msg || "Razas importadas correctamente");
        fetchBreeds();
      } else {
        alert("Error al importar razas: " + data.msg);
      }
    } catch (error) {
      console.error("Error importando razas:", error);
      alert("Error al conectar con el servidor");
    }
  };

  const handleAnimalTypeChange = (e) => {
    const type = e.target.value;
    setFormData({ ...formData, animal_type: type, breed_id: "", custom_animal_type: "" });
    
    if (type === "Perro" || type === "Gato") {
      setfilteredBreeds(breeds.filter(r => r.animal_type.toLowerCase() === type.toLowerCase()));
    } else {
      setfilteredBreeds([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
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
      } else {
        throw new Error(data.msg || "Error subiendo imagen");
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    
    // Determine the final animal_type to send
    const finalAnimalType = formData.animal_type === "Otros" ? formData.custom_animal_type : formData.animal_type;
    
    if (formData.animal_type === "Otros" && !finalAnimalType.trim()) {
      setMessage("Por favor, especifica el tipo de animal.");
      setSubmitting(false);
      return;
    }

    if ((formData.animal_type === "Perro" || formData.animal_type === "Gato") && !formData.breed_id) {
        setMessage("Por favor, selecciona una raza.");
        setSubmitting(false);
        return;
    }

    let imageUrl = formData.url;
    try {
      if (imageFile) {
        imageUrl = await uploadImage();
      }
    } catch (error) {
      setMessage("Error al subir la imagen. Por favor, intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name,
      animal_type: finalAnimalType,
      size: formData.size,
      breed_id: formData.breed_id || null,
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
        setMessage(errorData.msg || "Error al actualizar la mascota");
      }
    } catch (error) {
      console.error("Error al actualizar mascota:", error);
      setMessage("Error al conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Cargando datos de la mascota...</p></div>;
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Editar Mascota</h3>
            </div>
            <div className="card-body">
              {message && <div className="alert alert-danger">{message}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre de la Mascota</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Rex, Pelusa..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Foto de la Mascota</label>
                  {formData.url && !imageFile && (
                    <div className="mb-2">
                        <img src={formData.url} alt="Mascota" className="img-thumbnail" style={{ height: "100px" }} />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">Sube una nueva foto si quieres cambiar la actual (opcional).</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Animal</label>
                  <select 
                    className="form-select" 
                    name="animal_type" 
                    value={formData.animal_type} 
                    onChange={handleAnimalTypeChange}
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {formData.animal_type === "Otros" && (
                  <div className="mb-3">
                    <label className="form-label">Especificar Tipo de Animal</label>
                    <input
                      type="text"
                      className="form-control"
                      name="custom_animal_type"
                      value={formData.custom_animal_type}
                      onChange={handleInputChange}
                      placeholder="Ej. Loro, Hurón, Conejo..."
                      required={formData.animal_type === "Otros"}
                    />
                  </div>
                )}

                {(formData.animal_type === "Perro" || formData.animal_type === "Gato") && (
                  <div className="mb-3">
                    <label className="form-label d-flex justify-content-between align-items-center">
                      Raza
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleImportBreeds}
                      >
                        Importar Razas
                      </button>
                    </label>
                    <select 
                      className="form-select" 
                      name="breed_id" 
                      value={formData.breed_id} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Selecciona una raza --</option>
                      {filteredBreeds.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Tamaño / Peso aproximado</label>
                  <input
                    type="text"
                    className="form-control"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Pequeño (5kg), Grande (30kg)..."
                  />
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Link to="/private/user/pets" className="btn btn-outline-secondary">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar Cambios"}
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

