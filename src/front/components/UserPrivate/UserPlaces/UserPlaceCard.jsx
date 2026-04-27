import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserPlaceCard({ placeObj }) {
    const { store, dispatch } = useGlobalReducer();
    const { name, pet_rules, city, establishment_type, id, image_url } = placeObj
    const isFavorite = (store.privateUser?.favorite_places || []).includes(id);

    const establishmentTypeEmoji = {
        bar: "\u{1F37A}",
        restaurant: "\u{1F35D}",
        cafe: "\u{2615}"
    }

    async function handleAddToFavorites() {
        try {
            const userToken = store.userToken;
            const response = await fetch(`${backendUrl}/api/users/private/favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    place_id: id.toString()
                })
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const updatedPrivateUser = await response.json();
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
        } catch (error) {
            alert("Unable to add favorite right now. Please try again.");
        }
    }

    async function handleRemoveFromFavorites() {
        try {
            const userToken = store.userToken;
            const response = await fetch(`${backendUrl}/api/users/private/favorites`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    place_id: id.toString()
                })
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const userResponse = await fetch(`${backendUrl}/api/users/private`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            if (!userResponse.ok) {
                throw new Error(`User request failed with status ${userResponse.status}`);
            }

            const updatedPrivateUser = await userResponse.json();
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
        } catch (error) {
            alert("Unable to remove favorite right now. Please try again.");
        }
    }

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                {image_url && (
                <img
                    src={image_url}
                    className="card-img-top"
                    alt={name}
                    style={{ height: "260px", objectFit: "cover" }}
                />
            )}
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{name}</h5>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        {establishmentTypeEmoji[establishment_type]}
                        <span className="fst-italic">{establishment_type.toUpperCase()}</span>
                    </h6>
                    <div className="mb-3 d-flex flex-wrap gap-2 fw-bold">
                        {"\u{1F4CC}"}{city.city}
                    </div>
                    <div className="d-flex flex-column gap-3">
                        <p className="card-text m-0">{pet_rules}</p>
                        <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                            <Link to={`/user/private/places/view/${id}`} className="btn btn-outline-primary">View</Link>
                            <Link to={`/user/private/reservations/add/${id}`} className="btn btn-outline-success">Make a reservation</Link>
                            <button
                                type="button"
                                className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"} `}
                                onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                            >
                                ❤︎
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserPlaceCard
