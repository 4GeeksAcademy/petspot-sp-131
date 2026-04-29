import UserReservationsList from "../../../components/UserPrivate/UserReservations/UserReservationsList";
import { Link } from "react-router-dom";

function UserReservations() {
    return (
        <div className="mx-auto">
            <h1 className="text-center my-5 display-3">My Reservations</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <UserReservationsList />
        </div>
    );
}

export default UserReservations;
