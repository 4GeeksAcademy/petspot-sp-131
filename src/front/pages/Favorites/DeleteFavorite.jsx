import { Link } from "react-router-dom";
import DeleteFavoriteConfirmation from "../../components/Favorites/DeleteFavoriteConfirmation";

function DeleteFavorite() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Delete Favorite</h1>
                <div className="text-center my-5">
                    <Link to="/favorites" className="btn btn-secondary">Go Back to Favorites</Link>
                </div>
                <DeleteFavoriteConfirmation />
            </div>
        </>
    )
}

export default DeleteFavorite;
