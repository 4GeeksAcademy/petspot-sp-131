import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function AddFavoriteForm() {
    const [userName, setUserName] = useState("")
    const [placeName, setPlaceName] = useState("")
    const [users, setUsers] = useState([])
    const [places, setPlaces] = useState([])

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

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

        if (!userName || !placeName) {
            alert("Please complete all required fields before submitting the form.")
            return
        }

        const favoriteAlreadyExists = store.favorites.some((favorite) => (
            favorite.user_name.toLowerCase() === userName.toLowerCase() &&
            favorite.place_name.toLowerCase() === placeName.toLowerCase()
        ))

        if (favoriteAlreadyExists) {
            alert("This favorite already exists.")
            return
        }

        const body = {
            user: userName,
            place: placeName
        }

        async function addFavorite() {
            try {
                const response = await fetch(`${backendUrl}/api/favorites`, {
                    method: "POST",
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

                const newFavorite = await response.json()
                dispatch({
                    type: "ADD_FAVORITE",
                    payload: newFavorite
                })
                navigate("/favorites")
            } catch (error) {
                alert("Unable to add the favorite right now. Please try again.")
            }
        }

        addFavorite()
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="favoriteUser" className="form-label">User Name *</label>
                <select
                    id="favoriteUser"
                    name="user"
                    className="form-select"
                    onChange={(event) => setUserName(event.target.value)}
                    value={userName}
                    required
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
            <p className="text-body-secondary small mb-4">* Required fields</p>
            <div className="mt-5">
                <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
            </div>
        </form>
    );
}

export default AddFavoriteForm;
