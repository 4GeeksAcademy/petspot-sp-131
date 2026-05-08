import { forwardRef } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { handleAddToFavorites, handleRemoveFromFavorites } from "../../../services/userPrivateService";

const UserPlaceCard = forwardRef(function UserPlaceCard({ placeObj, isSelected = false, onSelect }, ref) {
    const { store, dispatch } = useGlobalReducer();
    const { name, pet_rules, city, establishment_type, id, image_url, address } = placeObj;
    const isFavorite = (store.privateUser?.favorite_places || []).includes(id);

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
            ref={ref}
            className={`user-places__card ${isSelected ? "is-selected" : ""}`}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.();
                }
            }}
        >
            <div className="user-places__image-wrapper">
                {image_url ? (
                    <img
                        src={image_url}
                        className="user-places__image"
                        alt={name}
                    />
                ) : (
                    <div className="user-places__image user-places__image--placeholder">
                        No image available
                    </div>
                )}
                <button
                    type="button"
                    className={`user-places__favorite ${isFavorite ? "is-active" : ""}`}
                    aria-label={isFavorite ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
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
            <div className="user-places__content">
                <p className="user-places__eyebrow">
                    {establishment_type?.toUpperCase() || "ESTABLISHMENT"}
                </p>
                <h5 className="user-places__title">{name}</h5>
                <p className="user-places__address">
                    {address} ({city?.city})
                </p>
                <div className="user-places__summary">{pet_rules}</div>
                <div className="user-places__actions" onClick={stopCardSelection}>
                    <Link
                        to={`/user/private/places/view/${id}`}
                        className="home-hero__button home-hero__button--primary"
                        onClick={stopCardSelection}
                    >
                        View details
                    </Link>
                    <Link
                        to={`/user/private/reservations/add/${id}`}
                        className="user-places__button user-places__button--primary"
                        onClick={stopCardSelection}
                    >
                        Make a reservation
                    </Link>
                </div>
            </div>
        </div>
    );
});

export default UserPlaceCard;
