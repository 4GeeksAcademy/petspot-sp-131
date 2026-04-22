import DeleteReservationCard from "../../components/Reservations/DeleteReservationCard";
import { Link } from "react-router-dom";

function DeleteReservation() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Delete Reservation</h1>
                <div className="text-center my-5">
                    <Link to="/reservations" className="btn btn-secondary">
                        Go Back to Reservations
                    </Link>
                </div>
                <DeleteReservationCard />
            </div>
        </>
    );
}

export default DeleteReservation;