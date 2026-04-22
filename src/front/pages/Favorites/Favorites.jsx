import FavoritesList from "../../components/Favorites/FavoritesList";
import { Link } from "react-router-dom";

function Favorites() {
    return (
        <>
            <div className="px-3 m-auto">
                <h1 className="text-center my-5 display-3">PetSpot Favorites {"\u{1F43E}"}</h1>
                <div className="text-center my-5">
                    <Link to="/favorites/add" className="btn btn-success">Add a New Favorite</Link>
                </div>
                <FavoritesList />
            </div>
        </>
    )
}

export default Favorites;
