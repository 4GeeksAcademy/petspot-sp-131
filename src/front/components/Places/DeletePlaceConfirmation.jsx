import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function DeletePlaceConfirmation() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const activePlace = store.places.find((place) => place.id === Number(id))

    async function handleDeletePlace() {
        try {
            const response = await fetch(`${backendUrl}/api/places/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json()
                const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                alert(`Error ${response.status}: ${backendMessage}`)
                return
            }

            dispatch({
                type: "DELETE_PLACE",
                payload: Number(id)
            })
            navigate("/places")
        } catch (error) {
            alert("Unable to delete the place right now. Please try again.")
        }
    }

    if (!activePlace) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Place not found</p>
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <p className="text-danger fw-semibold text-center mb-4">
                Are you sure you want to delete this place?
            </p>
            <div className="mb-2">
                <span className="fw-bold">Name: </span>{activePlace.name}
            </div>
            <div className="mb-2">
                <span className="fw-bold">Email: </span>{activePlace.email}
            </div>
            <div className="mb-2">
                <span className="fw-bold">Establishment type: </span>{activePlace.establishment_type}
            </div>
            <div className="mb-2">
                <span className="fw-bold">Address: </span>{activePlace.address}
            </div>
            <div className="mb-2">
                <span className="fw-bold">City: </span>
                {activePlace.city.city}
            </div>
            <div className="mb-4">
                <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
            </div>
            <button type="button" className="btn btn-danger d-block mx-auto" onClick={handleDeletePlace}>
                Confirm delete
            </button>
        </div>
    )
}

export default DeletePlaceConfirmation;
