import ReservationDetailCard from "../../components/Reservations/ReservationDetailCard";
import { Link } from "react-router-dom";

function ReservationDetail() {
    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Reservation Detail</h1>
                <div className="text-center my-5">
                    <Link to="/reservations" className="btn btn-secondary">
                        Go Back to Reservations
                    </Link>
                </div>
                <ReservationDetailCard />
            </div>
        </>
    );
}

export default ReservationDetail;