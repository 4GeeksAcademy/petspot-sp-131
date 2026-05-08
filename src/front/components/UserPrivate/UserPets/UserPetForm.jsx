import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import {
    createPet,
    getPetById,
    getPrivateUser,
    getRaces,
    updatePet,
    uploadPetImage
} from "../../../services/userPrivateService";

const OTHER_PET_FALLBACK_IMAGE = "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const initialFormData = {
    name: "",
    animal_type: "dog",
    other_type: "",
    race_id: "",
    size: "medium",
    url: ""
};

function UserPetForm({ mode = "create", petId = null }) {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [races, setRaces] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(mode === "edit");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const isEditing = mode === "edit";

    useEffect(() => {
        async function loadInitialData() {
            try {
                const racesResponse = await getRaces();
                setRaces(racesResponse);

                if (isEditing && petId) {
                    const petResponse = await getPetById(petId);
                    const isOtherType = petResponse.animal_type === "other";

                    setFormData({
                        name: petResponse.name || "",
                        animal_type: petResponse.animal_type || "dog",
                        other_type: isOtherType ? (petResponse.other_type || "") : "",
                        race_id: petResponse.race_id ? String(petResponse.race_id) : "",
                        size: petResponse.size || "medium",
                        url: petResponse.url || ""
                    });
                }
            } catch (error) {
                console.error("Unable to load pet form data:", error);
                setMessage(isEditing
                    ? "Unable to load this pet right now. Please try again."
                    : "Unable to load the pet form right now. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        loadInitialData();
    }, [isEditing, petId]);

    const filteredRaces = useMemo(() => {
        if (formData.animal_type === "dog") {
            return races.filter((race) => race.animal_type?.toLowerCase() === "perro");
        }

        if (formData.animal_type === "cat") {
            return races.filter((race) => race.animal_type?.toLowerCase() === "gato");
        }

        return [];
    }, [formData.animal_type, races]);

    async function refreshPrivateUser() {
        const privateUser = await getPrivateUser();
        dispatch({
            type: "GET_PRIVATE_USER",
            payload: privateUser
        });
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    }

    function handleAnimalTypeChange(event) {
        const selectedAnimalType = event.target.value;

        setFormData((currentData) => ({
            ...currentData,
            animal_type: selectedAnimalType,
            other_type: "",
            race_id: ""
        }));
    }

    function handleImageChange(event) {
        const nextImageFile = event.target.files?.[0] || null;
        setImageFile(nextImageFile);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        if (formData.animal_type === "other" && !formData.other_type.trim()) {
            setMessage("Please specify the animal type.");
            setIsSubmitting(false);
            return;
        }

        if ((formData.animal_type === "dog" || formData.animal_type === "cat") && !formData.race_id) {
            setMessage("Please select a breed.");
            setIsSubmitting(false);
            return;
        }

        try {
            const imageUrl = imageFile ? await uploadPetImage(imageFile) : formData.url || null;

            const payload = {
                name: formData.name.trim(),
                animal_type: formData.animal_type,
                other_type: formData.animal_type === "other" ? formData.other_type.trim() : null,
                race_id: formData.race_id || null,
                size: formData.size,
                url: imageUrl
            };

            if (isEditing && petId) {
                await updatePet(petId, payload);
            } else {
                await createPet(payload);
            }

            await refreshPrivateUser();
            navigate("/user/private/pets", { replace: true });
        } catch (error) {
            console.error("Unable to save pet:", error);
            setMessage(error.message || "Unable to save your pet right now. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <p style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "20px 0" }}>
                Cargando…
            </p>
        );
    }

    const previewImage = imageFile
        ? URL.createObjectURL(imageFile)
        : formData.url || (formData.animal_type === "other" ? OTHER_PET_FALLBACK_IMAGE : null);

    return (
        <div style={{
            maxWidth: 700, margin: "0 auto",
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "28px 32px",
        }}>
            {message && (
                <div style={{
                    background: "rgba(184,84,80,0.08)", color: "var(--admin-danger)",
                    border: "1px solid rgba(184,84,80,0.25)", borderRadius: "var(--admin-radius-sm)",
                    padding: "10px 14px", marginBottom: 16, fontSize: "0.875rem",
                }}>{message}</div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="petName" className="form-label">Pet Name *</label>
                    <input
                        id="petName"
                        name="name"
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ex. Rex, Fluffy..."
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="petPhoto" className="form-label">Pet Photo</label>
                    {previewImage && (
                        <div className="mb-2">
                            <img src={previewImage} alt="Pet preview" className="img-thumbnail" style={{ maxHeight: 140 }} />
                        </div>
                    )}
                    <input
                        id="petPhoto"
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

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

                {formData.animal_type === "other" && (
                    <div className="mb-3">
                        <label htmlFor="petOtherType" className="form-label">Animal Description *</label>
                        <input
                            id="petOtherType"
                            name="other_type"
                            type="text"
                            className="form-control"
                            value={formData.other_type}
                            onChange={handleInputChange}
                            placeholder="Ex. Rabbit, Parrot, Ferret..."
                            required
                        />
                    </div>
                )}

                {(formData.animal_type === "dog" || formData.animal_type === "cat") && (
                    <div className="mb-3">
                        <label htmlFor="petRace" className="form-label">Raza *</label>
                        <select
                            id="petRace"
                            name="race_id"
                            className="form-select"
                            value={formData.race_id}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select a breed</option>
                            {filteredRaces.map((race) => (
                                <option key={race.id} value={race.id}>{race.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="mb-3">
                    <label htmlFor="petSize" className="form-label">Size *</label>
                    <select
                        id="petSize"
                        name="size"
                        className="form-select"
                        value={formData.size}
                        onChange={handleInputChange}
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                <p className="text-body-secondary small mb-4">* Required fields</p>

                <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                    <button type="submit" disabled={isSubmitting} style={{
                        background: "var(--admin-success)", color: "#fff", border: "none",
                        borderRadius: "var(--admin-radius-sm)", padding: "7px 20px",
                        fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                    }}>
                        {isSubmitting ? "Guardando..." : (isEditing ? "Guardar cambios" : "Guardar mascota")}
                    </button>
                    <Link to="/user/private/pets" style={{
                        background: "transparent", color: "var(--admin-text-muted)",
                        border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                        padding: "7px 20px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                    }}>
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default UserPetForm;
