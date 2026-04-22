import EditReservationForm from "../../components/Reservations/EditReservationForm";
import { Link } from "react-router-dom";

function EditReservation() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit Reservation</h1>
                <div className="text-center my-5">
                    <Link to="/reservations" className="btn btn-secondary">
                        Go Back to Reservations
                    </Link>
                </div>
                <EditReservationForm />
            </div>
        </>
    );
}

export default EditReservation;