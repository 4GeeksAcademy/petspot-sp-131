import { useState } from "react";
import { Link } from "react-router-dom";

const animalTypeLabel = { dog: "Perro", cat: "Gato", other: "Otro" };
const sizeLabel = { small: "Pequeño", medium: "Mediano", large: "Grande" };

function PetImagePlaceholder({ petId }) {
    return (
        <Link to={`/user/private/pets/edit/${petId}`} style={{ textDecoration: "none" }}>
            <div style={{
                width: "100%", height: 220,
                background: "linear-gradient(135deg, #fdf0eb 0%, #f5ddd3 100%)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10,
                cursor: "pointer",
            }}>
                <span style={{ fontSize: "2.8rem" }}>📷</span>
                <span style={{
                    fontSize: "0.82rem", fontWeight: 600,
                    color: "var(--admin-accent, #8b4a3a)",
                    textAlign: "center", padding: "0 16px",
                }}>
                    Añade una foto de tu mascota
                </span>
                <span style={{
                    fontSize: "0.72rem", color: "var(--admin-text-muted)",
                    textAlign: "center", padding: "0 20px",
                }}>
                    Toca para editar
                </span>
            </div>
        </Link>
    );
}

function UserPetCard({ petObj }) {
    const imageUrl = petObj.url || petObj.race_url || null;
    const [imgError, setImgError] = useState(false);

    const animalTypeName = petObj.animal_type === "other"
        ? (petObj.other_type || animalTypeLabel.other)
        : (animalTypeLabel[petObj.animal_type] || petObj.animal_type);

    const showPlaceholder = !imageUrl || imgError;

    return (
        <div className="mb-3 mx-auto w-100" style={{
            maxWidth: 400,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            overflow: "hidden",
        }}>
            {showPlaceholder ? (
                <PetImagePlaceholder petId={petObj.id} />
            ) : (
                <img
                    src={imageUrl}
                    alt={petObj.name}
                    style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        objectPosition: "center top",
                        display: "block",
                        maxHeight: 220,
                        overflow: "hidden",
                    }}
                    onError={() => setImgError(true)}
                />
            )}
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
