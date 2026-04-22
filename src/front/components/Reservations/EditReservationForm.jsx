import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditReservationForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [userId, setUserId] = useState("");
    const [placeId, setPlaceId] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [peopleCount, setPeopleCount] = useState("");
    const [petCount, setPetCount] = useState("");
    const [zonePreference, setZonePreference] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("pending");

    const [users, setUsers] = useState([]);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [reservationRes, usersRes, placesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/reservations/${id}`),
                    fetch(`${backendUrl}/api/users`),
                    fetch(`${backendUrl}/api/places`)
                ]);

                if (!reservationRes.ok || !usersRes.ok || !placesRes.ok) {
                    throw new Error("Failed to load reservation data.");
                }

                const reservationData = await reservationRes.json();
                const usersData = await usersRes.json();
                const placesData = await placesRes.json();

                setUsers(usersData);
                setPlaces(placesData);

                setUserId(reservationData.user_id?.toString() || "");
                setPlaceId(reservationData.place_id?.toString() || "");
                setReservationDate(reservationData.reservation_date || "");
                setReservationTime(reservationData.reservation_time || "");
                setPeopleCount(reservationData.people_count?.toString() || "");
                setPetCount(reservationData.pet_count?.toString() || "");
                setZonePreference(reservationData.zone_preference || "");
                setNotes(reservationData.notes || "");
                setStatus(reservationData.status || "pending");
            } catch (error) {
                alert("Unable to load reservation data.");
                navigate("/reservations");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedZonePreference = zonePreference.trim();
        const trimmedNotes = notes.trim();

        if (!userId || !placeId || !reservationDate || !reservationTime || !peopleCount || petCount === "") {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        const body = {
            user_id: parseInt(userId),
            place_id: parseInt(placeId),
            reservation_date: reservationDate,
            reservation_time: reservationTime,
            people_count: parseInt(peopleCount),
            pet_count: parseInt(petCount),
            zone_preference: trimmedZonePreference || null,
            notes: trimmedNotes || null,
            status: status
        };

        try {
            const response = await fetch(`${backendUrl}/api/reservations/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.response || "Unable to update reservation.");
                return;
            }

            navigate("/reservations");
        } catch (error) {
            alert("Unable to update the reservation right now.");
        }
    }

    if (loading) return <p className="text-center">Loading form...</p>;

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
            style={{ maxWidth: 600 }}
        >
            <div className="mb-3">
                <label htmlFor="userId" className="form-label">User *</label>
                <select
                    onChange={(e) => setUserId(e.target.value)}
                    value={userId}
                    className="form-select"
                    id="userId"
                    required
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="placeId" className="form-label">Place *</label>
                <select
                    onChange={(e) => setPlaceId(e.target.value)}
                    value={placeId}
                    className="form-select"
                    id="placeId"
                    required
                >
                    <option value="">Select a place</option>
                    {places.map((place) => (
                        <option key={place.id} value={place.id}>
                            {place.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="reservationDate" className="form-label">Reservation Date *</label>
                <input
                    onChange={(e) => setReservationDate(e.target.value)}
                    value={reservationDate}
                    type="date"
                    className="form-control"
                    id="reservationDate"
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="reservationTime" className="form-label">Reservation Time *</label>
                <input
                    onChange={(e) => setReservationTime(e.target.value)}
                    value={reservationTime}
                    type="time"
                    className="form-control"
                    id="reservationTime"
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="peopleCount" className="form-label">People Count *</label>
                <input
                    onChange={(e) => setPeopleCount(e.target.value)}
                    value={peopleCount}
                    type="number"
                    min="1"
                    className="form-control"
                    id="peopleCount"
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="petCount" className="form-label">Pet Count *</label>
                <input
                    onChange={(e) => setPetCount(e.target.value)}
                    value={petCount}
                    type="number"
                    min="0"
                    className="form-control"
                    id="petCount"
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="zonePreference" className="form-label">Zone Preference</label>
                <input
                    onChange={(e) => setZonePreference(e.target.value)}
                    value={zonePreference}
                    type="text"
                    className="form-control"
                    id="zonePreference"
                />
            </div>

            <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                    onChange={(e) => setNotes(e.target.value)}
                    value={notes}
                    className="form-control"
                    id="notes"
                ></textarea>
            </div>

            <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                    onChange={(e) => setStatus(e.target.value)}
                    value={status}
                    className="form-select"
                    id="status"
                >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <p className="text-body-secondary small mb-4">* Required fields</p>

            <div className="mt-5">
                <button type="submit" className="btn btn-warning d-block mx-auto">
                    Update Reservation
                </button>
            </div>
        </form>
    );
}

export default EditReservationForm;