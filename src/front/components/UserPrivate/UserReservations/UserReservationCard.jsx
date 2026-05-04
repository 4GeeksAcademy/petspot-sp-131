import { Link } from "react-router-dom";

function UserReservationCard({ reservationObj, onCancelReservation }) {

    const {
        id,
        place_name,
        notes,
        zone_preference,
        people_count,
        pet_name,
        reservation_date,
        reservation_time,
        status,
        place_id
    } = reservationObj;

    return (
        <div className="card mb-4 mx-auto w-100 shadow-lg border-0" style={{ 
            maxWidth: "800px", 
            borderRadius: "20px", 
            background: "rgba(255, 255, 255, 0.7)", 
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            overflow: "hidden"
        }}>
            <div className="row g-0">
                <div className="col-md-4 d-flex flex-column justify-content-center align-items-center p-4 text-white" style={{ 
                    background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)",
                }}>
                    <div className="display-5 fw-bold mb-0">{reservation_time.substring(0, 5)}</div>
                    <div className="fs-5 opacity-75">{reservation_date}</div>
                    <span className={`badge rounded-pill mt-3 px-3 py-2 fw-bold text-uppercase ${status === "confirmed" ? "bg-success" : status === "pending" ? "bg-warning text-dark" : "bg-danger"}`} style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>
                        {status}
                    </span>
                </div>
                <div className="col-md-8">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h3 className="card-title fw-bold mb-0" style={{ color: "#1a237e" }}>{place_name}</h3>
                            <Link to={`/user/private/places/view/${place_id}`} className="btn btn-link text-decoration-none p-0 fw-bold">
                                Details <i className="fas fa-chevron-right small ms-1"></i>
                            </Link>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center text-muted">
                                    <div className="bg-light rounded-circle p-2 me-3" style={{ width: "40px", height: "40px", display: "grid", placeItems: "center" }}>
                                        <i className="fas fa-users text-primary"></i>
                                    </div>
                                    <div>
                                        <small className="d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Guests</small>
                                        <span className="fw-bold text-dark">{people_count} People</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="d-flex align-items-center text-muted">
                                    <div className="bg-light rounded-circle p-2 me-3" style={{ width: "40px", height: "40px", display: "grid", placeItems: "center" }}>
                                        <i className="fas fa-paw text-success"></i>
                                    </div>
                                    <div>
                                        <small className="d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Pets</small>
                                        <span className="fw-bold text-dark">{pet_name ? pet_name : "No pets"}</span>
                                    </div>
                                </div>
                            </div>
                            {zone_preference && (
                                <div className="col-12">
                                    <div className="d-flex align-items-center text-muted">
                                        <div className="bg-light rounded-circle p-2 me-3" style={{ width: "40px", height: "40px", display: "grid", placeItems: "center" }}>
                                            <i className="fas fa-layer-group text-info"></i>
                                        </div>
                                        <div>
                                            <small className="d-block text-uppercase fw-bold" style={{ fontSize: "0.65rem" }}>Preferred Zone</small>
                                            <span className="fw-bold text-dark">{zone_preference}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {notes && (
                            <div className="mb-4 p-3 bg-light rounded-3 border-start border-4 border-primary">
                                <small className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: "0.6rem" }}>Notes for the place</small>
                                <p className="mb-0 small italic">"{notes}"</p>
                            </div>
                        )}

                        <div className="d-flex flex-wrap gap-2 pt-3 border-top justify-content-end">
                            {status === "confirmed" && (
                                <Link to={`/user/private/reviews/add/${id}`} className="btn btn-sm btn-outline-warning rounded-pill px-3">
                                    <i className="fas fa-star me-1"></i> Review
                                </Link>
                            )}
                            <Link 
                                to={`/user/private/chats?id=${place_id}&name=${encodeURIComponent(place_name)}`} 
                                className="btn btn-sm btn-outline-success rounded-pill px-3"
                            >
                                <i className="fas fa-comment me-1"></i> Chat
                            </Link>
                            {status !== "cancelled" && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                                    onClick={() => onCancelReservation(id)}
                                >
                                    <i className="fas fa-times me-1"></i> Cancel
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserReservationCard;
