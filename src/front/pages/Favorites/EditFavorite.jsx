import EditFavoriteForm from "../../components/Favorites/EditFavoriteForm";
import { Link } from "react-router-dom";

function EditFavorite() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit Favorite</h1>
                <div className="text-center my-5">
                    <Link to="/favorites" className="btn btn-secondary">Go Back to Favorites</Link>
                </div>
                <EditFavoriteForm />
            </div>
        </>
    )
}

export default EditFavorite;
