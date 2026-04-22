import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function DeleteReservationCard() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);

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
                alert(error.message);
                navigate("/reservations");
            } finally {
                setLoading(false);
            }
        }

        getReservation();
    }, [id]);

    async function handleDelete() {
        try {
            const response = await fetch(`${backendUrl}/api/reservations/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.response || "Unable to delete reservation.");
                return;
            }

            navigate("/reservations");
        } catch (error) {
            alert("Unable to delete reservation right now.");
        }
    }

    if (loading) return <p className="text-center">Loading reservation...</p>;
    if (!reservation) return null;

    return (
        <div
            className="card mx-auto bg-secondary-subtle border-0 p-4 text-start"
            style={{ maxWidth: 700 }}
        >
            <h2 className="mb-4">Are you sure you want to delete this reservation?</h2>

            <div className="mb-3">
                <strong>Reservation:</strong> #{reservation.id}
            </div>
            <div className="mb-3">
                <strong>User:</strong> {reservation.user_name}
            </div>
            <div className="mb-3">
                <strong>Place:</strong> {reservation.place_name}
            </div>
            <div className="mb-3">
                <strong>Date:</strong> {reservation.reservation_date} at {reservation.reservation_time}
            </div>

            <div className="d-grid d-sm-flex gap-2 justify-content-sm-end mt-4">
                <button onClick={handleDelete} className="btn btn-danger">
                    Confirm Delete
                </button>
                <button onClick={() => navigate("/reservations")} className="btn btn-secondary">
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default DeleteReservationCard;