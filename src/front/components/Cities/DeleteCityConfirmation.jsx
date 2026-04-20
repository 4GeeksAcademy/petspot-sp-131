import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function DeleteCityConfirmation() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const activeCity = store.cities.find((city) => city.id === Number(id))

    async function handleDeleteCity() {
        try {
            const response = await fetch(`${backendUrl}/api/cities/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json()
                const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                alert(`Error ${response.status}: ${backendMessage}`)
                return
            }

            dispatch({
                type: "DELETE_CITY",
                payload: Number(id)
            })
            navigate("/cities")
        } catch (error) {
            alert("Unable to delete the city right now. Please try again.")
        }
    }

    if (!activeCity && store.cities.length > 0) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>City not found</p>
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <p className="text-danger fw-semibold text-center mb-4">
                Are you sure you want to delete this city?
            </p>
            <div className="mb-4">
                <span className="fw-bold">City name: </span>{activeCity.city}
            </div>
            <button type="button" className="btn btn-danger d-block mx-auto" onClick={handleDeleteCity}>
                Confirm delete
            </button>
        </div>
    );
}

export default DeleteCityConfirmation;
