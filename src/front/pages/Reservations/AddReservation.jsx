import AddReservationForm from "../../components/Reservations/AddReservationForm";
import { Link } from "react-router-dom";

function AddReservation() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Add a New Reservation</h1>
                <div className="text-center my-5">
                    <Link to="/reservations" className="btn btn-secondary">Go Back to Reservations</Link>
                </div>
                <AddReservationForm />
            </div>
        </>
    )
}

export default AddReservation;