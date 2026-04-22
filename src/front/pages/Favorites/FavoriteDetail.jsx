import { Link } from "react-router-dom";
import FavoriteDetailCard from "../../components/Favorites/FavoriteDetailCard";

function FavoriteDetail() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Favorite Details</h1>
                <div className="text-center my-5">
                    <Link to="/favorites" className="btn btn-secondary">Go Back to Favorites</Link>
                </div>
                <FavoriteDetailCard />
            </div>
        </>
    )
}

export default FavoriteDetail;
