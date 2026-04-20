import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function AddReservationForm() {

    const [userId, setUserId] = useState("")
    const [placeId, setPlaceId] = useState("")
    const [reservationDate, setReservationDate] = useState("")
    const [reservationTime, setReservationTime] = useState("")
    const [peopleCount, setPeopleCount] = useState("")
    const [petCount, setPetCount] = useState("")
    const [zonePreference, setZonePreference] = useState("")
    const [notes, setNotes] = useState("")
    const [status, setStatus] = useState("pending")

    const [users, setUsers] = useState([])
    const [places, setPlaces] = useState([])

    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [usersRes, placesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/users`),
                    fetch(`${backendUrl}/api/places`)
                ])
                if (!usersRes.ok || !placesRes.ok) {
                    throw new Error("Failed to fetch users or places")
                }
                const usersData = await usersRes.json()
                const placesData = await placesRes.json()
                setUsers(usersData)
                setPlaces(placesData)
            } catch (error) {
                alert("Unable to load data. Please try again.")
            }
        }
        fetchData()
    }, [])

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedZonePreference = zonePreference.trim()
        const trimmedNotes = notes.trim()

        if (!userId || !placeId || !reservationDate || !reservationTime || !peopleCount || petCount === "") {
            alert("Please complete all required fields before submitting the form.")
            return
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
        }

        async function addReservation() {
            try {
                const response = await fetch(`${backendUrl}/api/reservations`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                    alert(`Error ${response.status}: ${backendMessage}`)
                    return
                }
                const newReservation = await response.json()
                
                // Assuming we add to store, but since it's new, maybe refetch
                // For now, navigate
                navigate("/reservations")

            } catch (error) {
                alert("Unable to add the reservation right now. Please try again.")
            }
        }
        addReservation()
        
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="userId" className="form-label">User *</label>
                    <select onChange={(e) => setUserId(e.target.value)} value={userId} className="form-select" id="userId" required>
                        <option value="">Select a user</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="placeId" className="form-label">Place *</label>
                    <select onChange={(e) => setPlaceId(e.target.value)} value={placeId} className="form-select" id="placeId" required>
                        <option value="">Select a place</option>
                        {places.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="reservationDate" className="form-label">Reservation Date *</label>
                    <input onChange={(e) => setReservationDate(e.target.value)} value={reservationDate} type="date" className="form-control" id="reservationDate" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="reservationTime" className="form-label">Reservation Time *</label>
                    <input onChange={(e) => setReservationTime(e.target.value)} value={reservationTime} type="time" className="form-control" id="reservationTime" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="peopleCount" className="form-label">People Count *</label>
                    <input onChange={(e) => setPeopleCount(e.target.value)} value={peopleCount} type="number" min="1" className="form-control" id="peopleCount" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="petCount" className="form-label">Pet Count *</label>
                    <input onChange={(e) => setPetCount(e.target.value)} value={petCount} type="number" min="0" className="form-control" id="petCount" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="zonePreference" className="form-label">Zone Preference</label>
                    <input onChange={(e) => setZonePreference(e.target.value)} value={zonePreference} type="text" className="form-control" id="zonePreference" />
                </div>
                <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea onChange={(e) => setNotes(e.target.value)} value={notes} className="form-control" id="notes"></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select onChange={(e) => setStatus(e.target.value)} value={status} className="form-select" id="status">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>
            </form>
        </>
    )
}

export default AddReservationForm;