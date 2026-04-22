import AddFavoriteForm from "../../components/Favorites/AddFavoriteForm";
import { Link } from "react-router-dom";

function AddFavorite() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Add a New Favorite</h1>
                <div className="text-center my-5">
                    <Link to="/favorites" className="btn btn-secondary">Go Back to Favorites</Link>
                </div>
                <AddFavoriteForm />
            </div>
        </>
    )
}

export default AddFavorite;
