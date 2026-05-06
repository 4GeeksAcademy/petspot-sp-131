import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
    getPlaces,
    handleAddToFavorites,
    handleRemoveFromFavorites
} from "../../../services/userPrivateService";
import LocationMap from "../../LocationMap";

function UserPlaceDetailCard() {

    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const activePlace = store.places.find((place) => place.id === Number(id))
    const placeReviews = activePlace?.reviews || []
    const isFavorite = (store.privateUser?.favorite_places || []).includes(Number(id));

    useEffect(() => {
        async function loadPlaces() {
            try {
                const responseJSON = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load places right now. Please try again.")
            }
        }
        loadPlaces()
    }, [])

    async function addToFavorites() {
        try {
            const updatedPrivateUser = await handleAddToFavorites(id);
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
        } catch (error) {
            alert("Unable to add favorite right now. Please try again.");
        }
    }

    async function removeFromFavorites() {
        try {
            const updatedPrivateUser = await handleRemoveFromFavorites(id);
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
        } catch (error) {
            alert("Unable to remove favorite right now. Please try again.");
        }
    }

    if (!activePlace) {
        return (
            <p style={{ textAlign: "center", color: "var(--admin-danger)", fontSize: "0.9rem", padding: "20px 0" }}>
                Lugar no encontrado.
            </p>
        );
    }

    return (
        <div style={{
            maxWidth: 700, margin: "0 auto",
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "28px 32px",
        }}>
            {activePlace.image_url && (
                <img
                    src={activePlace.image_url}
                    alt={activePlace.name}
                    style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: "var(--admin-radius-sm)", marginBottom: 20 }}
                />
            )}
            <h4 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 16 }}>{activePlace.name}</h4>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 8 }}>
                <strong>Email:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{activePlace.email}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 8 }}>
                <strong>Tipo:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{activePlace.establishment_type}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 8 }}>
                <strong>Normas de mascotas:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{activePlace.pet_rules || "-"}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 16 }}>
                <strong>Dirección:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{activePlace.address}</span>
            </div>
            <LocationMap latitude={activePlace.latitude} longitude={activePlace.longitude} label="Place location" />
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-4 mb-4">
                <Link to={`/user/private/reservations/add/${id}`} style={{
                    background: "rgba(123,160,91,0.12)", color: "var(--admin-success)",
                    border: "1px solid rgba(123,160,91,0.3)", borderRadius: "var(--admin-radius-sm)",
                    padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>Reservar</Link>
                <Link to={`/user/private/chats?id=${id}&name=${encodeURIComponent(activePlace.name)}`} style={{
                    background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                    border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                    padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>Contactar</Link>
                <button type="button" onClick={isFavorite ? removeFromFavorites : addToFavorites} style={{
                    background: isFavorite ? "rgba(212,165,116,0.2)" : "transparent",
                    color: "var(--admin-warning)", border: "1px solid rgba(212,165,116,0.4)",
                    borderRadius: "var(--admin-radius-sm)", padding: "6px 16px",
                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                }}>
                    {isFavorite ? "♥ Favorito" : "♡ Favorito"}
                </button>
            </div>
            <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: 16 }}>
                <strong style={{ fontSize: "0.875rem", color: "var(--admin-text)" }}>Reseñas</strong>
                {placeReviews.length > 0 ? (
                    <div className="d-flex flex-column gap-2 mt-3">
                        {placeReviews.map((review) => (
                            <div key={review.id} style={{
                                background: "var(--admin-bg)", border: "1px solid var(--admin-border)",
                                borderRadius: "var(--admin-radius-sm)", padding: "10px 14px",
                            }}>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--admin-text)" }}>
                                    {review.title} <span style={{ color: "var(--admin-warning)" }}>({review.rating}/5)</span>
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginBottom: 4 }}>por {review.user_name}</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--admin-text)" }}>{review.content}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginTop: 8, fontSize: "0.875rem", color: "var(--admin-text-muted)" }}>Todavía no hay reseñas.</div>
                )}
            </div>
        </div>
    )
}

export default UserPlaceDetailCard;
