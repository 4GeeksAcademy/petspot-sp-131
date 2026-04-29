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
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Place not found</p>
    }

    return (
        <>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                {activePlace.image_url && (
                    <img
                        src={activePlace.image_url}
                        alt={activePlace.name}
                        className="img-fluid rounded mb-4"
                        style={{ width: "100%", height: "300px", objectFit: "cover" }}
                    />
                )}
                <div className="mb-3">
                    <span className="fw-bold">Name: </span>{activePlace.name}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Email: </span>{activePlace.email}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Establishment type: </span>{activePlace.establishment_type}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">City: </span>
                    {activePlace.city.city}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
                </div>
                <LocationMap
                    latitude={activePlace.city.latitude}
                    longitude={activePlace.city.longitude}
                    label="Place location"
                />
                <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5 mb-3">
                    <Link to={`/user/private/reservations/add/${id}`} className="btn btn-outline-success">Make a reservation</Link>
                    <button
                        type="button"
                        className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
                        onClick={isFavorite ? removeFromFavorites : addToFavorites}
                    >
                        ❤︎
                    </button>
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Reviews:</span>
                    {placeReviews.length > 0 ? (
                        <div className="mt-3 d-flex flex-column gap-3">
                            {placeReviews.map((review) => (
                                <div key={review.id} className="bg-light rounded p-3">
                                    <div><strong>{review.title}</strong> ({review.rating}/5)</div>
                                    <div className="text-body-secondary small mb-2">by {review.user_name}</div>
                                    <div>{review.content}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-2 text-body-secondary">No reviews yet.</div>
                    )}
                </div>
            </div>
        </>
    )
}

export default UserPlaceDetailCard;
