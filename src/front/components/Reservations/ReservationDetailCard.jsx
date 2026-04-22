import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function ReservationDetailCard() {
    const { id } = useParams();
    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function getReservation() {
            try {
                const response = await fetch(`${backendUrl}/api/reservations/${id}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.response || "Unable to load reservation.");
                }

                const data = await response.json();
                setReservation(data);
            } catch (error) {
                setError(error.message);
            }
        }

        getReservation();
    }, [id]);

    if (error) return <p className="text-danger text-center">{error}</p>;
    if (!reservation) return <p className="text-center">Loading reservation...</p>;

    return (
        <div className="card mb-3 mx-auto w-100 bg-secondary-subtle border-0 text-start" style={{ maxWidth: 800 }}>
            <div className="card-body">
                <h5 className="card-title card-header bg-secondary-subtle mb-3 ps-0 h2">
                    Reservation #{reservation.id}
                </h5>

                <div className="mb-3">
                    <strong>User:</strong> {reservation.user_name}
                </div>

                <div className="mb-3">
                    <strong>Place:</strong> {reservation.place_name}
                </div>

                <div className="mb-3">
                    <strong>Date:</strong> {reservation.reservation_date} at {reservation.reservation_time}
                </div>

                <div className="mb-3">
                    <strong>People:</strong> {reservation.people_count}, <strong>Pets:</strong> {reservation.pet_count}
                </div>

                {reservation.zone_preference && (
                    <div className="mb-3">
                        <strong>Zone Preference:</strong> {reservation.zone_preference}
                    </div>
                )}

                {reservation.notes && (
                    <div className="mb-3">
                        <strong>Notes:</strong> {reservation.notes}
                    </div>
                )}

                <div className="mb-3">
                    <strong>Status:</strong>{" "}
                    <span
                        className={`badge ${
                            reservation.status === "confirmed"
                                ? "bg-success"
                                : reservation.status === "pending"
                                ? "bg-warning"
                                : "bg-secondary"
                        }`}
                    >
                        {reservation.status}
                    </span>
                </div>

                <div className="d-grid d-sm-flex gap-2 justify-content-sm-end">
                    <Link to={`/reservations/edit/${reservation.id}`} className="btn btn-outline-warning">
                        Edit
                    </Link>
                    <Link to={`/reservations/delete/${reservation.id}`} className="btn btn-outline-danger">
                        Delete
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ReservationDetailCard;