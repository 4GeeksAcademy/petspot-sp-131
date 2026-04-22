import { Link } from "react-router-dom";

function ReservationCard({ reservationObj }) {
    const { id, user_name, place_name, reservation_date, reservation_time, people_count, pet_count, zone_preference, notes, status } = reservationObj

    return (
        <>
            <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0" style={{ maxWidth: 800 }}>
                <div className="card-body">
                    <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">Reservation #{id}</h5>
                    <div className="mb-3">
                        <strong>User:</strong> {user_name}
                    </div>
                    <div className="mb-3">
                        <strong>Place:</strong> {place_name}
                    </div>
                    <div className="mb-3">
                        <strong>Date:</strong> {reservation_date} at {reservation_time}
                    </div>
                    <div className="mb-3">
                        <strong>People:</strong> {people_count}, <strong>Pets:</strong> {pet_count}
                    </div>
                    {zone_preference && <div className="mb-3">
                        <strong>Zone Preference:</strong> {zone_preference}
                    </div>}
                    {notes && <div className="mb-3">
                        <strong>Notes:</strong> {notes}
                    </div>}
                    <div className="mb-3">
                        <strong>Status:</strong> <span className={`badge ${status === 'confirmed' ? 'bg-success' : status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>{status}</span>
                    </div>
                    <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                        <Link to={`/reservations/edit/${id}`} className="btn btn-outline-warning">Edit</Link>
                        <Link to={`/reservations/delete/${id}`} className="btn btn-outline-danger">Delete</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ReservationCard