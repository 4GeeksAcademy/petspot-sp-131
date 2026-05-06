import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { handleRemoveFromFavorites } from "../../../services/userPrivateService";

const establishmentTypeEmoji = { bar: "🍺", restaurant: "🍝", cafe: "☕" };

function UserFavoriteCard({ favPlaceObj }) {
    const { dispatch } = useGlobalReducer();
    const { name, city, establishment_type, id } = favPlaceObj;

    async function removeFromFavorites() {
        try {
            const updatedPrivateUser = await handleRemoveFromFavorites(id);
            dispatch({ type: "GET_PRIVATE_USER", payload: updatedPrivateUser });
        } catch (error) {
            alert("Unable to remove favorite right now. Please try again.");
        }
    }

    return (
        <div className="mb-3 mx-auto w-100" style={{
            maxWidth: 800,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "16px 20px 20px",
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--admin-border)", paddingBottom: 10, marginBottom: 12 }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--admin-text)", margin: 0 }}>{name}</h5>
                <button onClick={removeFromFavorites} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--admin-text-muted)", fontSize: "1rem", lineHeight: 1,
                }} title="Eliminar favorito" aria-label="Eliminar favorito">
                    <i className="fa-solid fa-xmark" />
                </button>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 6 }}>
                {establishmentTypeEmoji[establishment_type]} <span style={{ fontStyle: "italic" }}>{establishment_type?.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 16 }}>
                📍 {city?.city}
            </div>
            <div className="d-flex justify-content-end">
                <Link to={`/user/private/places/view/${id}`} style={{
                    background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                    border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                    padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                }}>Ver lugar</Link>
            </div>
        </div>
    );
}

export default UserFavoriteCard;
