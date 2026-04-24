import UserFavoritesList from "../../../components/UserPrivate/UserFavorites/UserFavoritesList";

function UserFavorites() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Favorites</h1>
            <UserFavoritesList />
        </div>
    );
}

export default UserFavorites;
