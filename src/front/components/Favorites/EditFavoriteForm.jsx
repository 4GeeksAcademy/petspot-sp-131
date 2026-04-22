import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function EditFavoriteForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("")
    const [placeName, setPlaceName] = useState("")
    const [users, setUsers] = useState([])
    const [places, setPlaces] = useState([])

    const activeFavorite = store.favorites.find((favorite) => favorite.id === Number(id))

    useEffect(() => {
        if (activeFavorite) {
            setUserName(activeFavorite.user_name)
            setPlaceName(activeFavorite.place_name)
        }
    }, [])

    useEffect(() => {
        async function loadOptions() {
            try {
                const [usersResponse, placesResponse] = await Promise.all([
                    fetch(`${backendUrl}/api/users`),
                    fetch(`${backendUrl}/api/places`)
                ])

                if (!usersResponse.ok || !placesResponse.ok) {
                    throw new Error("Unable to load favorite options")
                }

                const usersJSON = await usersResponse.json()
                const placesJSON = await placesResponse.json()

                setUsers(usersJSON)
                setPlaces(placesJSON)
            } catch (error) {
                alert("Unable to load users and places right now. Please try again.")
            }
        }

        loadOptions()
    }, [])

    function handleSubmit(event) {
        event.preventDefault()

        if (!placeName) {
            alert("Please select a place.")
            return
        }

        const favoriteAlreadyExists = store.favorites.some((favorite) => (
            favorite.id !== Number(id) &&
            favorite.user_name.toLowerCase() === userName.toLowerCase() &&
            favorite.place_name.toLowerCase() === placeName.toLowerCase()
        ))

        if (favoriteAlreadyExists) {
            alert("This favorite relation already exists.")
            return
        }

        const body = {
            place: placeName
        }

        async function updateFavorite() {
            try {
                const response = await fetch(`${backendUrl}/api/favorites/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                    alert(`Error ${response.status}: ${backendMessage}`)
                    return
                }

                const updatedFavorite = await response.json()
                dispatch({
                    type: "UPDATE_FAVORITE",
                    payload: updatedFavorite
                })
                navigate("/favorites")
            } catch (error) {
                alert("Unable to update the favorite right now. Please try again.")
            }
        }

        updateFavorite()
    }

    if (!activeFavorite) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Favorite not found</p>
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="favoriteUser" className="form-label opacity-50 fst-italic">User Name</label>
                <select
                    className="form-select"
                    id="favoriteUser"
                    name="user"
                    value={userName}
                    disabled
                >
                    <option value="">Select a user</option>
                    {users.map((user) => {
                        return <option value={user.name} key={user.id}>{user.name}</option>
                    })}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="favoritePlace" className="form-label">Place Name *</label>
                <select
                    id="favoritePlace"
                    name="place"
                    className="form-select"
                    onChange={(event) => setPlaceName(event.target.value)}
                    value={placeName}
                    required
                >
                    <option value="">Select a place</option>
                    {places.map((place) => {
                        return <option value={place.name} key={place.id}>{place.name}</option>
                    })}
                </select>
            </div>
            <p className="text-body-secondary small mb-4">* Required field</p>
            <div className="mt-5">
                <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
            </div>
        </form>
    );
}

export default EditFavoriteForm;
