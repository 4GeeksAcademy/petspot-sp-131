function UserReservationCard({reservationObj}) {

    const { 
        place_name, 
        notes, 
        zone_preference, 
        people_count, 
        pet_count, 
        reservation_date, 
        reservation_time,
        status
    } = reservationObj

    return (
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
                    <button type="button" className="btn btn-outline-primary">
                        Open Chat
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserReservationCard;
