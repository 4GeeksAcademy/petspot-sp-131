import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddPet = () => {
  const [formData, setFormData] = useState({
    name: "",
    animal_type: "Perro",
    custom_animal_type: "",
    race_id: "",
    size: ""
  });
  const [races, setRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
        // By default, filter for "Perro" since it's the initial state
        setFilteredRaces(data.filter(r => r.animal_type.toLowerCase() === "perro"));
      }
    } catch (error) {
      console.error("Error al cargar razas:", error);
    }
  };

  const handleAnimalTypeChange = (e) => {
    const type = e.target.value;
    setFormData({ ...formData, animal_type: type, race_id: "", custom_animal_type: "" });
    
    if (type === "Perro" || type === "Gato") {
      setFilteredRaces(races.filter(r => r.animal_type.toLowerCase() === type.toLowerCase()));
    } else {
      setFilteredRaces([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Determine the final animal_type to send
    const finalAnimalType = formData.animal_type === "Otros" ? formData.custom_animal_type : formData.animal_type;
    
    if (formData.animal_type === "Otros" && !finalAnimalType.trim()) {
      setMessage("Por favor, especifica el tipo de animal.");
      setSubmitting(false);
      return;
    }

    if ((formData.animal_type === "Perro" || formData.animal_type === "Gato") && !formData.race_id) {
        setMessage("Por favor, selecciona una raza.");
        setSubmitting(false);
        return;
    }

    const payload = {
      name: formData.name,
      animal_type: finalAnimalType,
      size: formData.size,
      race_id: formData.race_id || null
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
        setMessage(errorData.msg || "Error al crear la mascota");
      }
    } catch (error) {
      console.error("Error al crear mascota:", error);
      setMessage("Error al conectar con el servidor");
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
              <h3 className="mb-0">Añadir Nueva Mascota</h3>
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
                    <label className="form-label">Raza</label>
                    <select 
                      className="form-select" 
                      name="race_id" 
                      value={formData.race_id} 
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Selecciona una raza --</option>
                      {filteredRaces.map(r => (
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
                  <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar Mascota"}
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
