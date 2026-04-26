import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserAddReservationForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [peopleCount, setPeopleCount] = useState("");
    const [petCount, setPetCount] = useState("");
    const [zonePreference, setZonePreference] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        async function getPlaces() {
            try {
                if (store.places.length > 0) {
                    return;
                }

                const response = await fetch(`${backendUrl}/api/places`);
                if (!response.ok) {
                    throw new Error(`Places request failed with status ${response.status}`);
                }

                const places = await response.json();
                dispatch({
                    type: "GET_PLACES",
                    payload: places
                });
            } catch (error) {
                console.error("Unable to load places:", error);
            }
        }

        getPlaces();
    }, [dispatch, store.places.length]);

    const selectedPlace = store.places.find((place) => place.id === Number(id));

    async function getPrivateUser() {
        try {
            const userToken = localStorage.getItem("userToken");
            if (!userToken) {
                return;
            }

            const response = await fetch(`${backendUrl}/api/users/private`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`User request failed with status ${response.status}`);
            }

            const privateUser = await response.json();
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: privateUser
            });
        } catch (error) {
            console.error("Unable to load private user:", error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedZonePreference = zonePreference.trim();
        const trimmedNotes = notes.trim();

        if (!id || !reservationDate || !reservationTime || !peopleCount || petCount === "") {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        try {
            const userToken = localStorage.getItem("userToken");
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
                    pet_count: petCount,
                    zone_preference: trimmedZonePreference || null,
                    notes: trimmedNotes || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const backendMessage = errorData.response || errorData.message || "Unknown backend error";
                alert(`Error ${response.status}: ${backendMessage}`);
                return;
            }

            await getPrivateUser();
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
                    <input onChange={(event) => setReservationDate(event.target.value)} value={reservationDate} type="date" className="form-control" id="reservationDate" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="reservationTime" className="form-label">Reservation Time *</label>
                    <input onChange={(event) => setReservationTime(event.target.value)} value={reservationTime} type="time" className="form-control" id="reservationTime" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="peopleCount" className="form-label">People Count *</label>
                    <input onChange={(event) => setPeopleCount(event.target.value)} value={peopleCount} type="number" min="1" className="form-control" id="peopleCount" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="petCount" className="form-label">Pet Count *</label>
                    <input onChange={(event) => setPetCount(event.target.value)} value={petCount} type="number" min="0" className="form-control" id="petCount" required />
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
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>
            </form>
        </>
    );
}

export default UserAddReservationForm;
