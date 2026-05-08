import UserFavoritesList from "../../../components/UserPrivate/UserFavorites/UserFavoritesList";

function UserFavorites() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-heart me-2" style={{ color: "var(--admin-primary)" }} />
                Mis favoritos
            </h5>
            <UserFavoritesList />
        </div>
    );
}

export default UserFavorites;
