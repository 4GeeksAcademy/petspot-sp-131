import UserFavoritesList from "../../../components/UserPrivate/UserFavorites/UserFavoritesList";
import { Link } from "react-router-dom";

function UserFavorites() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Favorites</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <UserFavoritesList />
        </div>
    );
}

export default UserFavorites;
