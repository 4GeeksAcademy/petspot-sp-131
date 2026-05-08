import UserReviewsList from "../../../components/UserPrivate/UserReviews/UserReviewsList";

function UserReviews() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-star me-2" style={{ color: "var(--admin-primary)" }} />
                Mis reseñas
            </h5>
            <UserReviewsList />
        </div>
    );
}

export default UserReviews;
