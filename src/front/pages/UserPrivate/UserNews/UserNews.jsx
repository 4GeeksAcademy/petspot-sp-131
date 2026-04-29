import { Link } from "react-router-dom";
import UserNewsList from "../../../components/UserPrivate/UserNews/UserNewsList";

function UserNews() {
    return (
        <>
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">PetSpot News 📰</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
        </div>
            <UserNewsList />
        </>
    );
}

export default UserNews;
