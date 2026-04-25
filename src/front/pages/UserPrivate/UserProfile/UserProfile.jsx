import UserProfileCard from "../../../components/UserPrivate/UserProfile/UserProfileCard";
import { Link } from "react-router-dom";

function UserProfile() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Profile</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <UserProfileCard />
        </div>
    );
}

export default UserProfile;
