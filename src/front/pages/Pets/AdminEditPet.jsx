import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRaces } from "../../services/userPrivateService";

const FALLBACK_IMAGES = {
  dog:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=60",
  cat:   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60",
  other: "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=400&auto=format&fit=crop",
};

const initialFormData = {
  name: "",
  animal_type: "dog",
  other_type: "",
  race_id: "",
  size: "medium",
  url: "",
};

function AdminEditPet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const adminToken = localStorage.getItem("tokenAdmin");

  const [formData, setFormData] = useState(initialFormData);
  const [races, setRaces] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "danger" });

  /* ── Load pet + races ─────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        // Fetch races (public endpoint)
        const racesData = await getRaces();
        setRaces(racesData);

        // Fetch this specific pet using admin token
        const petRes = await fetch(`${backendUrl}/api/pets/${id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!petRes.ok) throw new Error(`Failed to load pet (status ${petRes.status})`);
        const pet = await petRes.json();

        setFormData({
          name: pet.name || "",
          animal_type: pet.animal_type || "dog",
          other_type: pet.other_type || "",
          race_id: pet.race_id ? String(pet.race_id) : "",
          size: pet.size || "medium",
          url: pet.url || "",
        });
      } catch (err) {
        console.error("AdminEditPet load error:", err);
        setMessage({ text: "Could not load pet. " + err.message, type: "danger" });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  /* ── Filtered breed list ──────────────────────────────────── */
  const filteredRaces = useMemo(() => {
    if (formData.animal_type === "dog") return races.filter((r) => r.animal_type?.toLowerCase() === "perro");
    if (formData.animal_type === "cat") return races.filter((r) => r.animal_type?.toLowerCase() === "gato");
    return [];
  }, [formData.animal_type, races]);

  /* ── Handlers ─────────────────────────────────────────────── */
  function handleInput(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAnimalTypeChange(e) {
    setFormData((prev) => ({
      ...prev,
      animal_type: e.target.value,
      other_type: "",
      race_id: "",
    }));
  }

  function handleImageChange(e) {
    setImageFile(e.target.files?.[0] || null);
  }

  async function uploadImage(file) {
    const data = new FormData();
    data.append("image", file);
    const res = await fetch(`${backendUrl}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: data,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || "Image upload failed");
    return json.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ text: "", type: "danger" });

    if (formData.animal_type === "other" && !formData.other_type.trim()) {
      setMessage({ text: "Please specify the animal type.", type: "danger" });
      return;
    }
    if ((formData.animal_type === "dog" || formData.animal_type === "cat") && !formData.race_id) {
      setMessage({ text: "Please select a breed.", type: "danger" });
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : formData.url || null;

      const payload = {
        name: formData.name.trim(),
        animal_type: formData.animal_type,
        other_type: formData.animal_type === "other" ? formData.other_type.trim() : null,
        race_id: formData.race_id || null,
        size: formData.size,
        url: imageUrl,
      };

      const res = await fetch(`${backendUrl}/api/admin/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || "Update failed");

      setMessage({ text: "Pet updated successfully!", type: "success" });
      setTimeout(() => navigate("/usuario/admin/pets"), 800);
    } catch (err) {
      console.error("AdminEditPet save error:", err);
      setMessage({ text: err.message || "Could not save changes.", type: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ── Preview image ────────────────────────────────────────── */
  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : formData.url || FALLBACK_IMAGES[formData.animal_type] || FALLBACK_IMAGES.other;

  /* ── Render ───────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <p>Loading pet…</p>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 680 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "var(--admin-text)", fontWeight: 700 }}>
          <i className="fa-solid fa-paw me-2" style={{ color: "var(--admin-primary)" }} />
          Edit Pet
        </h2>
        <Link to="/usuario/admin/pets" className="btn btn-secondary btn-sm">
          ← Back to Pets
        </Link>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius)",
          boxShadow: "var(--admin-shadow-sm)",
          padding: "28px 32px",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label htmlFor="petName" className="form-label">Pet Name *</label>
            <input
              id="petName"
              name="name"
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleInput}
              placeholder="Ex. Rex, Fluffy…"
              required
            />
          </div>

          {/* Photo preview + upload */}
          <div className="mb-3">
            <label htmlFor="petPhoto" className="form-label">Pet Photo</label>
            {previewImage && (
              <div className="mb-2 text-center">
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{
                    maxHeight: 180,
                    maxWidth: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid var(--admin-border)",
                  }}
                />
              </div>
            )}
            <input
              id="petPhoto"
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="form-text">Upload a new photo, or leave blank to keep the current one.</div>
          </div>

          {/* Animal type */}
          <div className="mb-3">
            <label htmlFor="petAnimalType" className="form-label">Animal Type *</label>
            <select
              id="petAnimalType"
              name="animal_type"
              className="form-select"
              value={formData.animal_type}
              onChange={handleAnimalTypeChange}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Other type description */}
          {formData.animal_type === "other" && (
            <div className="mb-3">
              <label htmlFor="petOtherType" className="form-label">Animal Description *</label>
              <input
                id="petOtherType"
                name="other_type"
                type="text"
                className="form-control"
                value={formData.other_type}
                onChange={handleInput}
                placeholder="Ex. Rabbit, Parrot, Ferret…"
                required
              />
            </div>
          )}

          {/* Breed */}
          {(formData.animal_type === "dog" || formData.animal_type === "cat") && (
            <div className="mb-3">
              <label htmlFor="petRace" className="form-label">Breed *</label>
              <select
                id="petRace"
                name="race_id"
                className="form-select"
                value={formData.race_id}
                onChange={handleInput}
                required
              >
                <option value="">Select a breed</option>
                {filteredRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Size */}
          <div className="mb-3">
            <label htmlFor="petSize" className="form-label">Size *</label>
            <select
              id="petSize"
              name="size"
              className="form-select"
              value={formData.size}
              onChange={handleInput}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <p className="text-body-secondary small mb-4">* Required fields</p>

          <div className="d-flex gap-2 justify-content-end">
            <Link
              to="/usuario/admin/pets"
              className="btn btn-outline-secondary btn-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditPet;
