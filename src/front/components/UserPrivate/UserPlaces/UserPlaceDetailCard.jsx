import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserPlaceDetailCard() {

    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const activePlace = store.places.find((place) => place.id === Number(id))
    const isFavorite = (store.privateUser?.favorite_places || []).includes(Number(id));

    async function handleAddToFavorites() {
        try {
            const userToken = localStorage.getItem("userToken");
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
            const userToken = localStorage.getItem("userToken");
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
                <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                    <Link to={`/user/private/reservations/add/${id}`} className="btn btn-outline-success">Make a reservation</Link>
                    <button
                        type="button"
                        className={`btn ${isFavorite ? "btn-warning" : "btn-outline-warning"}`}
                        onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                    >
                        ❤︎
                    </button>
                </div>
            </div>
        </>
    )
}

export default UserPlaceDetailCard;
