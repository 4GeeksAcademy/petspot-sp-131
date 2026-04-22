import ReservationsList from "../../components/Reservations/ReservationsList";
import { Link } from "react-router-dom";

function Reservations() {
    return (
        <>
            <div className="px-3 m-auto">
                <h1 className="text-center my-5 display-3">Reservations</h1>
                <div className="text-center my-5">
                    <Link to="/reservations/form" className="btn btn-success">Add New Reservation</Link>
                </div>
                <ReservationsList />
            </div>
        </>
    )
}

export default Reservations;