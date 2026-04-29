import { Link } from "react-router-dom";
import UserReviewsList from "../../../components/UserPrivate/UserReviews/UserReviewsList";

function UserReviews() {
    return (
        <div className="mx-auto">
            <h1 className="text-center my-5 display-3">My Reviews</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <UserReviewsList />
        </div>
    );
}

export default UserReviews;
