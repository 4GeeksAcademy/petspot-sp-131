import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import {
    handleAddToFavorites,
    handleRemoveFromFavorites
} from "../../../services/userPrivateService";

function UserPlaceCard({ placeObj, isSelected = false, onSelect }) {
    const { store, dispatch } = useGlobalReducer();
    const { name, pet_rules, city, establishment_type, id, image_url, address } = placeObj
    const isFavorite = (store.privateUser?.favorite_places || []).includes(id);

    const establishmentTypeEmoji = {
        bar: "\u{1F37A}",
        restaurant: "\u{1F35D}",
        cafe: "\u{2615}"
    }

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

    function stopCardSelection(event) {
        event.stopPropagation();
    }

    return (
        <div
            className="card bg-secondary-subtle border-0"
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
                maxWidth: "400px",
                minWidth: "280px",
                cursor: "pointer",
                borderRadius: "0.5rem",
                border: isSelected ? "2px solid var(--bs-primary)" : "2px solid transparent",
                boxShadow: isSelected ? "0 0 0 0.2rem rgba(13, 110, 253, 0.15)" : "none"
            }}
        >
            {image_url && (
                <img
                    src={image_url}
                    className="card-img-top"
                    alt={name}
                    style={{ height: "200px", objectFit: "cover" }}
                />
            )}
            <div className="card-body" style={{ borderRadius: "0.5rem" }}>
                <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{name}</h5>
                <h6 className="card-subtitle mb-2 text-body-secondary">
                    {establishmentTypeEmoji[establishment_type]}
                    <span className="fst-italic">{establishment_type.toUpperCase()}</span>
                </h6>
                <div className="mb-3 d-flex flex-wrap gap-2 fw-bold">
                    {"\u{1F4CC}"}
                    {address} ({city.city})
                </div>
                <div className="d-flex flex-column gap-3" onClick={stopCardSelection}>
                    <p className="card-text m-0">{pet_rules}</p>
                    <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                        <Link
                            to={`/user/private/places/view/${id}`}
                            className="btn btn-outline-primary"
                            onClick={stopCardSelection}
                        >
                            View
                        </Link>
                        <Link
                            to={`/user/private/reservations/add/${id}`}
                            className="btn btn-outline-success"
                            onClick={stopCardSelection}
                        >
                            Make a reservation
                        </Link>
                        <button
                            type="button"
                            className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"} `}
                            onClick={(event) => {
                                stopCardSelection(event);
                                if (isFavorite) {
                                    removeFromFavorites();
                                    return;
                                }

                                addToFavorites();
                            }}
                        >
                            {"\u2665"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserPlaceCard;
