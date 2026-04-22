import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

function FavoriteDetailCard() {

    const { store } = useGlobalReducer();
    const { id } = useParams();
    const activeFavorite = store.favorites.find((favorite) => favorite.id === Number(id))

    if (!activeFavorite) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Favorite not found</p>
    }

    return (
        <>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <span className="fw-bold">User name: </span>{activeFavorite.user_name}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">User ID: </span>{activeFavorite.user_id}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Place name: </span>{activeFavorite.place_name}
                </div>
                <div>
                    <span className="fw-bold">Place ID: </span>{activeFavorite.place_id}
                </div>
            </div>
        </>
    )
}

export default FavoriteDetailCard;
