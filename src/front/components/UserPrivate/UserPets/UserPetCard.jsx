import { Link } from "react-router-dom";

const FALLBACK_IMAGES = {
    dog:   "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=60",
    cat:   "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60",
    other: "https://images.unsplash.com/vector-1738926674638-65961800cd33?q=80&w=400&auto=format&fit=crop",
};

const animalTypeLabel = { dog: "Perro", cat: "Gato", other: "Otro" };
const sizeLabel = { small: "Pequeño", medium: "Mediano", large: "Grande" };

function UserPetCard({ petObj }) {
    const imageUrl = petObj.url || petObj.race_url || FALLBACK_IMAGES[petObj.animal_type] || FALLBACK_IMAGES.other;
    const animalTypeName = petObj.animal_type === "other"
        ? (petObj.other_type || animalTypeLabel.other)
        : (animalTypeLabel[petObj.animal_type] || petObj.animal_type);

    return (
        <div className="mb-3 mx-auto w-100" style={{
            maxWidth: 400,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            overflow: "hidden",
        }}>
            <img
                src={imageUrl}
                alt={petObj.name}
                style={{ width: "100%", height: 220, objectFit: "cover" }}
                onError={(e) => { e.target.src = FALLBACK_IMAGES[petObj.animal_type] || FALLBACK_IMAGES.other; }}
            />
            <div style={{ padding: "16px 20px 20px" }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--admin-text)", borderBottom: "1px solid var(--admin-border)", paddingBottom: 10, marginBottom: 12 }}>
                    {petObj.name}
                </h5>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 6 }}>
                    <strong>Tipo:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{animalTypeName}</span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 6 }}>
                    <strong>Raza:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{petObj.race_name || "Mestizo / Sin especificar"}</span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 16 }}>
                    <strong>Tamaño:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{sizeLabel[petObj.size] || petObj.size}</span>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                    <Link to={`/user/private/pets/edit/${petObj.id}`} style={{
                        background: "rgba(123,160,91,0.12)", color: "var(--admin-success)",
                        border: "1px solid rgba(123,160,91,0.3)", borderRadius: "var(--admin-radius-sm)",
                        padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                    }}>Editar</Link>
                    <Link to={`/user/private/pets/delete/${petObj.id}`} style={{
                        background: "rgba(184,84,80,0.08)", color: "var(--admin-danger)",
                        border: "1px solid rgba(184,84,80,0.25)", borderRadius: "var(--admin-radius-sm)",
                        padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                    }}>Eliminar</Link>
                </div>
            </div>
        </div>
    );
}

export default UserPetCard;
