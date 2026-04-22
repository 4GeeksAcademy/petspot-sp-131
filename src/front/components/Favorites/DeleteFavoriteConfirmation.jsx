import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function DeleteFavoriteConfirmation() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const activeFavorite = store.favorites.find((favorite) => favorite.id === Number(id))

    async function handleDeleteFavorite() {
        try {
            const response = await fetch(`${backendUrl}/api/favorites/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json()
                const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                alert(`Error ${response.status}: ${backendMessage}`)
                return
            }

            dispatch({
                type: "DELETE_FAVORITE",
                payload: Number(id)
            })
            navigate("/favorites")
        } catch (error) {
            alert("Unable to delete the favorite right now. Please try again.")
        }
    }

    if (!activeFavorite) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Favorite not found</p>
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <p className="text-danger fw-semibold text-center mb-4">
                Are you sure you want to delete this favorite?
            </p>
            <div className="mb-3">
                <span className="fw-bold">User name: </span>{activeFavorite.user_name}
            </div>
            <div className="mb-4">
                <span className="fw-bold">Place name: </span>{activeFavorite.place_name}
            </div>
            <button type="button" className="btn btn-danger d-block mx-auto" onClick={handleDeleteFavorite}>
                Confirm delete
            </button>
        </div>
    );
}

export default DeleteFavoriteConfirmation;
