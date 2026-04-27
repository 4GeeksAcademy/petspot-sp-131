import { Link } from "react-router-dom";

function UserReservationCard({ reservationObj, onCancelReservation }) {

    const {
        id,
        place_name,
        notes,
        zone_preference,
        people_count,
        pet_count,
        reservation_date,
        reservation_time,
        status,
        place_id
    } = reservationObj

    return (

        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">{place_name}</h5>
                    <div className="mb-3">
                        <strong>Date:</strong> {reservation_date} at {reservation_time}
                    </div>
                    <div className="mb-3">
                        <strong>People:</strong> {people_count}
                    </div>
                    <div className="mb-3">
                        <strong>Pets:</strong> {pet_count}
                    </div>
                    {zone_preference && (
                        <div className="mb-3">
                            <strong>Zone Preference:</strong> {zone_preference}
                        </div>
                    )}
                    <div className="mb-3">
                        <strong>Status:</strong>{" "}
                        <span className={`badge ${status === "confirmed" ? "bg-success" : status === "pending" ? "bg-warning" : "bg-secondary"}`}>
                            {status}
                        </span>
                    </div>
                    {notes && (
                        <div className="mb-0">
                            <strong>Notes:</strong> {notes}
                        </div>
                    )}
                    <div className="mt-4 d-grid d-sm-flex gap-2 justify-content-sm-end">
                        <Link to={`/user/private/places/view/${place_id}`} className="btn btn-outline-primary">View</Link>
                        {status === "confirmed" && (
                            <Link to={`/user/private/reviews/add/${id}`} className="btn btn-outline-warning">Write a review</Link>
                        )}
                        <button type="button" className="btn btn-outline-success">
                            Open Chat
                        </button>
                        {status !== "cancelled" && (
                            <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => onCancelReservation(id)}
                            >
                                Cancel Reservation
                            </button>
                        )}
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserReservationCard;
