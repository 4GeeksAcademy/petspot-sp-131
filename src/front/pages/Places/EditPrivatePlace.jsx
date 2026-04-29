import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditPrivatePlace() {
    const { store, dispatch } = useGlobalReducer();
    const activePlace = store.privatePlace;

    const [email, setEmail] = useState("");
    const [placeName, setPlaceName] = useState("");
    const [establishmentType, setEstablishmentType] = useState("");
    const [city, setCity] = useState("");
    const [petRules, setPetRules] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (activePlace && activePlace.id) {
            setEmail(activePlace.email);
            setPlaceName(activePlace.name);
            setEstablishmentType(activePlace.establishment_type);
            setCity(String(activePlace.city.id));
            setPetRules(activePlace.pet_rules || "");
            setStartTime(activePlace.start_time ? activePlace.start_time.substring(0, 5) : "");
            setEndTime(activePlace.end_time ? activePlace.end_time.substring(0, 5) : "");
        } else {
            // If we don't have the active place loaded, go back to dashboard
            navigate("/places/private");
        }
    }, [activePlace, navigate]);

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedPlaceName = placeName.trim();
        const trimmedPetRules = petRules.trim();
        const trimmedCity = city.trim();

        if (!trimmedPlaceName || !establishmentType || !trimmedCity) {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        if (trimmedPetRules && trimmedPetRules.length > 250) {
            alert("Pet rules cannot exceed 250 characters.");
            return;
        }

        const body = {
            name: trimmedPlaceName,
            establishment_type: establishmentType,
            city_id: trimmedCity,
            pet_rules: trimmedPetRules,
            start_time: startTime || null,
            end_time: endTime || null
        };

        async function updatePrivatePlace() {
            try {
                const tokenPlace = localStorage.getItem("token_place");
                if (!tokenPlace) {
                    alert("Please log in first.");
                    navigate("/places/login");
                    return;
                }

                const response = await fetch(`${backendUrl}/api/places/private`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenPlace}`
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const backendMessage = errorData.response || errorData.message || "Unknown backend error";
                    alert(`Error ${response.status}: ${backendMessage}`);
                    return;
                }

                // Refresh data
                const refreshResponse = await fetch(`${backendUrl}/api/places/private`, {
                    headers: {
                        Authorization: `Bearer ${tokenPlace}`
                    }
                });

                if (refreshResponse.ok) {
                    const updatedData = await refreshResponse.json();
                    dispatch({
                        type: "GET_PRIVATE_PLACE",
                        payload: updatedData
                    });
                }

                alert("Profile updated successfully!");
                navigate("/places/private");

            } catch (error) {
                alert("Unable to update the profile right now. Please try again.");
            }
        }
        updatePrivatePlace();
    }

    useEffect(() => {
        if (store.cities.length === 0) {
            async function getCities() {
                try {
                    const response = await fetch(`${backendUrl}/api/cities`);
                    if (!response.ok) {
                        throw new Error(`Request failed with status ${response.status}`);
                    }
                    const responseJSON = await response.json();
                    dispatch({
                        type: "GET_CITIES",
                        payload: responseJSON
                    });
                } catch (error) {
                    alert("Unable to load cities right now. Please try again.");
                }
            }
            getCities();
        }
    }, [store.cities.length, dispatch]);

    if (!activePlace || !activePlace.id) {
        return <p className="text-center text-body-secondary mt-5">Loading profile...</p>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="placeEmail" className="form-label opacity-50">Email</label>
                    <input disabled value={email} type="email" className="form-control" id="placeEmail" />
                    <small className="form-text text-muted">Email cannot be changed.</small>
                </div>
                <hr className="my-4" />
                <div className="mb-3">
                    <label htmlFor="placeName" className="form-label">Name *</label>
                    <input onChange={(event) => setPlaceName(event.target.value)} value={placeName} type="text" className="form-control" id="placeName" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Establishment Type *</label>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "bar"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeBar" value="bar" required />
                        <label className="form-check-label" htmlFor="establishmentTypeBar">Bar</label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "cafe"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeCafe" value="cafe" required />
                        <label className="form-check-label" htmlFor="establishmentTypeCafe">Cafe</label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "restaurant"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeRestaurant" value="restaurant" required />
                        <label className="form-check-label" htmlFor="establishmentTypeRestaurant">Restaurant</label>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="placeCity" className="form-label">City *</label>
                    <select className="form-select" id="placeCity" onChange={(event) => setCity(event.target.value)} value={city} required>
                        <option value="">Select a city</option>
                        {store.cities.map((cityObj, i) => (
                            <option value={cityObj.id} key={`${cityObj.city}-${i}`}>{cityObj.city}</option>
                        ))}
                    </select>
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="startTime" className="form-label">Opening Time</label>
                        <input
                            type="time"
                            className="form-control"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="endTime" className="form-label">Closing Time</label>
                        <input
                            type="time"
                            className="form-control"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <div className="col-12 mt-1">
                        <small className="text-muted">Set your operating hours so users can book correctly.</small>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="petRules" className="form-label">Pet rules</label>
                    <textarea onChange={(event) => setPetRules(event.target.value)} value={petRules} className="form-control" id="petRules" style={{ maxHeight: 250 }} maxLength="250"></textarea>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-4 text-center">
                    <button type="submit" className="btn btn-warning me-3">Save Changes</button>
                    <button type="button" onClick={() => navigate("/places/private")} className="btn btn-outline-secondary">Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default EditPrivatePlace;
