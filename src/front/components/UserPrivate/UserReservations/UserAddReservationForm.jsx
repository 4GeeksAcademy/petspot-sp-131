import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getPlaces, getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserAddReservationForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [peopleCount, setPeopleCount] = useState("");
    const [petId, setPetId] = useState("");
    const [zonePreference, setZonePreference] = useState("");
    const [notes, setNotes] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        async function loadPlaces() {
            try {
                if (store.places.length > 0) {
                    return;
                }

                const places = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: places
                });
            } catch (error) {
                console.error("Unable to load places:", error);
            }
        }

        loadPlaces();
    }, [dispatch, store.places.length]);

    const selectedPlace = store.places.find((place) => place.id === Number(id));

    async function loadPrivateUser() {
        try {
            const privateUser = await getPrivateUser();
            if (!privateUser) {
                return;
            }

            dispatch({
                type: "GET_PRIVATE_USER",
                payload: privateUser
            });
        } catch (error) {
            console.error("Unable to load private user:", error);
        }
    }

    useEffect(() => {
        if (!store.privateUser) {
            loadPrivateUser();
        }
    }, [store.privateUser]);

    useEffect(() => {
        async function loadSlots() {
            if (!reservationDate || !id) return;
            try {
                const response = await fetch(`${backendUrl}/api/places/${id}/availability?date=${reservationDate}`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableSlots(data.slots || []);
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error("Error loading slots:", error);
                setAvailableSlots([]);
            }
        }
        loadSlots();
        // Reset time when date changes
        setReservationTime("");
    }, [reservationDate, id]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedZonePreference = zonePreference.trim();
        const trimmedNotes = notes.trim();

        if (!id || !reservationDate || !reservationTime || !peopleCount) {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        try {
            const userToken = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/reservations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    user_id: store.privateUser?.id,
                    place_id: id.toString(),
                    reservation_date: reservationDate,
                    reservation_time: reservationTime,
                    people_count: peopleCount,
                    pet_id: petId || null,
                    zone_preference: trimmedZonePreference || null,
                    notes: trimmedNotes || null,
                    amount: 0 // Optional: sending 0 makes it confirmed by default per backend logic
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const backendMessage = errorData.response || errorData.message || "Unknown backend error";
                alert(`Error ${response.status}: ${backendMessage}`);
                return;
            }

            await loadPrivateUser();
            navigate("/user/private/reservations");
        } catch (error) {
            alert("Unable to add the reservation right now. Please try again.");
        }
    }

    return (
        <>
            <div className="text-center my-5">
                <Link to={`/user/private/places/view/${id}`} className="btn btn-secondary">
                    Go Back to Place
                </Link>
            </div>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <h1 className="text-center mb-4 display-6">New Reservation</h1>
                
                {selectedPlace?.start_time && selectedPlace?.end_time && (
                    <div className="alert alert-info border-0 shadow-sm mb-4 py-2 text-center">
                        <i className="fas fa-clock me-2"></i>
                        Operating Hours: <strong>{selectedPlace.start_time.substring(0, 5)} - {selectedPlace.end_time.substring(0, 5)}</strong>
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">Place</label>
                    <input
                        type="text"
                        className="form-control"
                        value={selectedPlace ? selectedPlace.name : `Place #${id}`}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="reservationDate" className="form-label">Reservation Date *</label>
                    <input 
                        onChange={(event) => setReservationDate(event.target.value)} 
                        value={reservationDate} 
                        type="date" 
                        className="form-control" 
                        id="reservationDate" 
                        min={new Date().toISOString().split('T')[0]}
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="reservationTime" className="form-label">Reservation Time *</label>
                    {availableSlots.length > 0 ? (
                        <select
                            className="form-select"
                            id="reservationTime"
                            value={reservationTime}
                            onChange={(e) => setReservationTime(e.target.value)}
                            required
                        >
                            <option value="">Select an available time slot</option>
                            {availableSlots.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>
                    ) : (
                        reservationDate ? (
                            <div className="alert alert-warning p-2 mb-0">No available slots for this date.</div>
                        ) : (
                            <div className="alert alert-secondary p-2 mb-0">Please select a date first.</div>
                        )
                    )}
                </div>
                <div className="mb-3">
                    <label htmlFor="peopleCount" className="form-label">People Count *</label>
                    <input onChange={(event) => setPeopleCount(event.target.value)} value={peopleCount} type="number" min="1" className="form-control" id="peopleCount" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="petSelection" className="form-label">Which pet are you bringing?</label>
                    <select 
                        className="form-select" 
                        id="petSelection" 
                        value={petId}
                        onChange={(e) => setPetId(e.target.value)}
                    >
                        <option value="">None (0 pets)</option>
                        {store.privateUser?.pets?.map(pet => (
                            <option key={pet.id} value={pet.id}>{pet.name} ({pet.animal_type})</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="zonePreference" className="form-label">Zone Preference</label>
                    <input onChange={(event) => setZonePreference(event.target.value)} value={zonePreference} type="text" className="form-control" id="zonePreference" />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea onChange={(event) => setNotes(event.target.value)} value={notes} className="form-control" id="notes"></textarea>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto shadow-sm px-5" disabled={!reservationTime}>
                        Confirm Reservation
                    </button>
                </div>
            </form>
        </>
    );
}

export default UserAddReservationForm;
