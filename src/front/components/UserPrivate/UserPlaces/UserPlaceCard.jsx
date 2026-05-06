import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { handleAddToFavorites, handleRemoveFromFavorites } from "../../../services/userPrivateService";

const establishmentTypeEmoji = { bar: "🍺", restaurant: "🍝", cafe: "☕" };

function UserPlaceCard({ placeObj, isSelected = false, onSelect }) {
    const { store, dispatch } = useGlobalReducer();
    const { name, pet_rules, city, establishment_type, id, image_url, address } = placeObj;
    const isFavorite = (store.privateUser?.favorite_places || []).includes(id);

    async function addToFavorites() {
        try {
            const updatedPrivateUser = await handleAddToFavorites(id);
            dispatch({ type: "GET_PRIVATE_USER", payload: updatedPrivateUser });
        } catch (error) {
            alert("Unable to add favorite right now. Please try again.");
        }
    }

    async function removeFromFavorites() {
        try {
            const updatedPrivateUser = await handleRemoveFromFavorites(id);
            dispatch({ type: "GET_PRIVATE_USER", payload: updatedPrivateUser });
        } catch (error) {
            alert("Unable to remove favorite right now. Please try again.");
        }
    }

    function stopCardSelection(event) {
        event.stopPropagation();
    }

    return (
        <div
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.();
                }
            }}
            style={{
                flex: "1 1 320px",
                maxWidth: 400,
                minWidth: 280,
                cursor: "pointer",
                background: "var(--admin-surface)",
                border: isSelected ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: isSelected ? "0 0 0 3px rgba(201,123,99,0.15)" : "var(--admin-shadow-sm)",
                overflow: "hidden",
            }}
        >
            {image_url && (
                <img src={image_url} alt={name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            )}
            <div style={{ padding: "14px 16px 18px" }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--admin-text)", borderBottom: "1px solid var(--admin-border)", paddingBottom: 8, marginBottom: 10 }}>
                    {name}
                </h5>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    {establishmentTypeEmoji[establishment_type]} <span style={{ fontStyle: "italic" }}>{establishment_type?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 10 }}>
                    📍 {address} ({city?.city})
                </div>
                <div onClick={stopCardSelection}>
                    {pet_rules && (
                        <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginBottom: 12 }}>{pet_rules}</p>
                    )}
                    <div className="d-flex flex-wrap gap-2 justify-content-end">
                        <Link to={`/user/private/places/view/${id}`} onClick={stopCardSelection} style={{
                            background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                            border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                            padding: "4px 12px", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
                        }}>Ver</Link>
                        <Link to={`/user/private/reservations/add/${id}`} onClick={stopCardSelection} style={{
                            background: "rgba(123,160,91,0.12)", color: "var(--admin-success)",
                            border: "1px solid rgba(123,160,91,0.3)", borderRadius: "var(--admin-radius-sm)",
                            padding: "4px 12px", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
                        }}>Reservar</Link>
                        <button type="button" onClick={(e) => { stopCardSelection(e); isFavorite ? removeFromFavorites() : addToFavorites(); }} style={{
                            background: isFavorite ? "rgba(212,165,116,0.2)" : "transparent",
                            color: "var(--admin-warning)", border: "1px solid rgba(212,165,116,0.4)",
                            borderRadius: "var(--admin-radius-sm)", padding: "4px 12px",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                        }}>♥</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserPlaceCard;
