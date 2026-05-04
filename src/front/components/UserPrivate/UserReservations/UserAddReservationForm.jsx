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
            if (!userToken) {
                alert("You need to sign in before creating a reservation.");
                return;
            }

            const response = await fetch(`${backendUrl}/api/users/private/reservations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    place_id: id.toString(),
                    reservation_date: reservationDate,
                    reservation_time: reservationTime,
                    people_count: peopleCount,
                    pet_id: petId || null,
                    zone_preference: trimmedZonePreference || null,
                    notes: trimmedNotes || null,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const backendMessage = errorData.response || errorData.message || "Unknown backend error";
                alert(`Error ${response.status}: ${backendMessage}`);
                return;
            }

            await response.json();
            await loadPrivateUser();
            navigate("/user/private/reservations");
        } catch (error) {
            alert("Unable to add the reservation right now. Please try again.");
        }
    }

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <Link to={`/user/private/places/view/${id}`} className="btn btn-outline-primary rounded-pill px-4">
                    <i className="fas fa-arrow-left me-2"></i> Back to Establishment
                </Link>
            </div>
            
            <div className="card shadow-lg border-0 mx-auto" style={{ 
                maxWidth: "700px", 
                background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,245,255,0.9))", 
                backdropFilter: "blur(15px)", 
                borderRadius: "24px",
                overflow: "hidden"
            }}>
                <div className="card-header border-0 pt-5 pb-2 text-center bg-transparent">
                    <h1 className="fw-bold mb-0" style={{ color: "#1a237e", letterSpacing: "-1px" }}>Book Your Visit</h1>
                    <p className="text-muted">Secure your spot at {selectedPlace ? selectedPlace.name : "this establishment"}</p>
                </div>

                <div className="card-body p-4 p-md-5">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-12">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Establishment</label>
                                <div className="p-3 rounded-4 bg-white border border-light shadow-sm d-flex align-items-center">
                                    <i className="fas fa-store text-primary me-3 fs-4"></i>
                                    <span className="fw-bold fs-5">{selectedPlace ? selectedPlace.name : `Place #${id}`}</span>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="reservationDate" className="form-label fw-bold text-secondary small text-uppercase">Pick a Date *</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-4"><i className="far fa-calendar-alt text-primary"></i></span>
                                    <input 
                                        onChange={(event) => setReservationDate(event.target.value)} 
                                        value={reservationDate} 
                                        type="date" 
                                        className="form-control border-start-0 rounded-end-4 bg-white" 
                                        id="reservationDate" 
                                        min={new Date().toISOString().split('T')[0]}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="peopleCount" className="form-label fw-bold text-secondary small text-uppercase">Guests *</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-4"><i className="fas fa-users text-primary"></i></span>
                                    <input 
                                        onChange={(event) => setPeopleCount(event.target.value)} 
                                        value={peopleCount} 
                                        type="number" 
                                        min="1" 
                                        className="form-control border-start-0 rounded-end-4 bg-white" 
                                        id="peopleCount" 
                                        placeholder="Number of people"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-bold text-secondary small text-uppercase mb-3">Available Time Slots *</label>
                                {availableSlots.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2 justify-content-center p-3 rounded-4 bg-white border border-light shadow-sm">
                                        {availableSlots.map(slot => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={`btn rounded-pill px-3 py-2 fw-bold transition-all ${reservationTime === slot ? 'btn-primary shadow' : 'btn-outline-primary'}`}
                                                onClick={() => setReservationTime(slot)}
                                                style={{ minWidth: "90px" }}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-4 rounded-4 bg-light border border-dashed text-muted">
                                        {reservationDate ? (
                                            <>
                                                <i className="fas fa-calendar-times mb-2 fs-3"></i>
                                                <p className="mb-0">No availability found for this date.</p>
                                                <small>The establishment might be closed or fully booked.</small>
                                            </>
                                        ) : (
                                            <p className="mb-0 italic text-secondary">Select a date to view available times</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-12">
                                <label htmlFor="petSelection" className="form-label fw-bold text-secondary small text-uppercase">Bringing a Pet?</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-white border-end-0 rounded-start-4"><i className="fas fa-paw text-primary"></i></span>
                                    <select 
                                        className="form-select border-start-0 rounded-end-4 bg-white" 
                                        id="petSelection" 
                                        value={petId}
                                        onChange={(e) => setPetId(e.target.value)}
                                    >
                                        <option value="">No pet this time</option>
                                        {store.privateUser?.pets?.map(pet => (
                                            <option key={pet.id} value={pet.id}>{pet.name} ({pet.animal_type})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-md-12">
                                <label htmlFor="zonePreference" className="form-label fw-bold text-secondary small text-uppercase">Zone Preference</label>
                                <input 
                                    onChange={(event) => setZonePreference(event.target.value)} 
                                    value={zonePreference} 
                                    type="text" 
                                    className="form-control form-control-lg rounded-4" 
                                    id="zonePreference" 
                                    placeholder="e.g. Terrace, Window, Indoor..."
                                />
                            </div>

                            <div className="col-md-12">
                                <label htmlFor="notes" className="form-label fw-bold text-secondary small text-uppercase">Special Requests</label>
                                <textarea 
                                    onChange={(event) => setNotes(event.target.value)} 
                                    value={notes} 
                                    className="form-control rounded-4" 
                                    id="notes" 
                                    rows="3"
                                    placeholder="Any allergies or special needs?"
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-5 text-center">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg fw-bold w-100" 
                                disabled={!reservationTime}
                                style={{ 
                                    background: "linear-gradient(45deg, #1a237e, #0d47a1)", 
                                    border: "none",
                                    fontSize: "1.1rem"
                                }}
                            >
                                <i className="fas fa-check-circle me-2"></i> Confirm Reservation
                            </button>
                            <p className="mt-3 text-muted small"><i className="fas fa-info-circle me-1"></i> Instant confirmation. No payment required today.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserAddReservationForm;
