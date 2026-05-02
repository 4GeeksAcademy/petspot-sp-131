import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import PlaceScheduleManager from "../../components/Places/PlaceScheduleManager";
import LocationMap from "../../components/LocationMap";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditPrivatePlace() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState("");
    const [validationMessageType, setValidationMessageType] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        establishment_type: "",
        city_id: "",
        address: "",
        place_id: "",
        pet_rules: "",
        start_time: "",
        end_time: ""
    });
    const [mapPosition, setMapPosition] = useState({
        lat: store.privatePlace?.latitude || null,
        lng: store.privatePlace?.longitude || null
    })
    const [suggestions, setSuggestions] = useState([])
    const [addressSearchTerm, setAddressSearchTerm] = useState("");

    // Get PRIVATE PLACE
    useEffect(() => {
        async function loadPrivatePlace() {
            const tokenPlace = localStorage.getItem("token_place");
            if (!tokenPlace) {
                alert("Please log in first.");
                navigate("/places/login");
                return;
            }

            if (store.privatePlace?.id) {
                setFormData((currentData) => ({
                    ...currentData,
                    email: store.privatePlace.email || "",
                    name: store.privatePlace.name || "",
                    establishment_type: store.privatePlace.establishment_type || "",
                    city_id: store.privatePlace.city?.id ? String(store.privatePlace.city.id) : "",
                    address: store.privatePlace.address || "",
                    place_id: "",
                    pet_rules: store.privatePlace.pet_rules || "",
                    start_time: store.privatePlace.start_time ? store.privatePlace.start_time.substring(0, 5) : "",
                    end_time: store.privatePlace.end_time ? store.privatePlace.end_time.substring(0, 5) : ""
                }));
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/api/places/private`, {
                    headers: {
                        Authorization: `Bearer ${tokenPlace}`
                    }
                });
                const responseJSON = await response.json();

                if (!response.ok) {
                    const backendMessage = responseJSON.response || responseJSON.message || "Unknown backend error";
                    alert(`Error ${response.status}: ${backendMessage}`);
                    navigate("/places/private");
                    return;
                }

                dispatch({
                    type: "GET_PRIVATE_PLACE",
                    payload: responseJSON
                });

                setFormData((currentData) => ({
                    ...currentData,
                    email: responseJSON.email || "",
                    name: responseJSON.name || "",
                    establishment_type: responseJSON.establishment_type || "",
                    city_id: responseJSON.city?.id ? String(responseJSON.city.id) : "",
                    address: responseJSON.address || "",
                    place_id: "",
                    pet_rules: responseJSON.pet_rules || "",
                    start_time: responseJSON.start_time ? responseJSON.start_time.substring(0, 5) : "",
                    end_time: responseJSON.end_time ? responseJSON.end_time.substring(0, 5) : ""
                }));
            } catch (error) {
                alert("Unable to load the private place information right now. Please try again.");
                navigate("/places/private");
            }
        }

        loadPrivatePlace();
    }, [dispatch, navigate, store.privatePlace]);

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
    }, [dispatch, store.cities.length]);

    useEffect(() => {
        if (addressSearchTerm.length < 3) {
            setSuggestions([])
            return;
        }

        async function loadSuggestions() {
            try {
                const response = await fetch(`${backendUrl}/api/autocomplete/address?input=${addressSearchTerm}`)
                if (!response.ok) {
                    throw new Error(`Suggestions request failed with status ${response.status}`);
                }
                const responseJSON = await response.json()
                setSuggestions(responseJSON)

            } catch (error) {
                console.error("Unable to load suggestions")
            }
        }
        loadSuggestions()
    }, [addressSearchTerm])

    function handleChange(event) {
        const { name, value } = event.target;
        if (name === "address" || name === "city_id") {
            setValidationMessage("");
            setValidationMessageType("");
        }

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
            ...(name === "address" ? { place_id: "" } : {})
        }));

        if (event.target.name === "address") {
            setAddressSearchTerm(value);
        }
    }

    async function handleSuggestionClick(suggestion) {
        setFormData((currentData) => ({
            ...currentData,
            address: suggestion.description,
            place_id: suggestion.place_id
        }));
        setAddressSearchTerm("")
        setSuggestions([])

        try {
            const response = await fetch(`${backendUrl}/api/places/details?place_id=${suggestion.place_id}`);
            if (!response.ok) {
                throw new Error(`Suggestions request failed with status ${response.status}`);
            }
            const data = await response.json();

            setMapPosition({
                lat: data.lat,
                lng: data.lng,
            });

        } catch (error) {
            console.error("Unable to load lat/lng")
        }

    }

    function handleRemoveLocation(event) {
        event.preventDefault();
        setValidationMessage("");
        setValidationMessageType("");
        setFormData((currentData) => ({
            ...currentData,
            address: "",
            place_id: ""
        }));
        setAddressSearchTerm("");
        setSuggestions([]);
        setMapPosition(null)
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedName = formData.name.trim();
        const trimmedCityId = formData.city_id.trim();
        const trimmedPetRules = formData.pet_rules.trim();
        const trimmedAddress = formData.address.trim();
        const trimmedPlaceId = formData.place_id.trim();

        if (!trimmedName || !formData.establishment_type) {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        if (!trimmedAddress && !trimmedCityId) {
            setValidationMessage("Enter an address or choose a fallback city.");
            setValidationMessageType("danger");
            return;
        }

        if (trimmedPetRules.length > 250) {
            alert("Pet rules cannot exceed 250 characters.");
            return;
        }

        let validatedAddress = trimmedAddress;
        let validatedCityId = trimmedCityId;

        if (trimmedAddress) {
            try {
                const validationPayload = { address: trimmedAddress };
                if (trimmedPlaceId) {
                    validationPayload.place_id = trimmedPlaceId;
                }

                const validationResponse = await fetch(`${backendUrl}/api/geocode/place-address`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(validationPayload)
                });
                const validationResponseJSON = await validationResponse.json();

                if (!validationResponse.ok) {
                    const backendMessage = validationResponseJSON.response || validationResponseJSON.message || "Unable to validate the address.";
                    setValidationMessage(backendMessage);
                    setValidationMessageType("danger");
                    return;
                }

                validatedAddress = validationResponseJSON.formatted_address || trimmedAddress;
                validatedCityId = validationResponseJSON.city_id ? String(validationResponseJSON.city_id) : "";

                setFormData((currentData) => ({
                    ...currentData,
                    address: validatedAddress,
                    city_id: validatedCityId || currentData.city_id,
                    place_id: trimmedPlaceId
                }));
                setValidationMessage("");
                setValidationMessageType("");
            } catch (error) {
                setValidationMessage("Unable to validate the address right now. Please try again.");
                setValidationMessageType("danger");
                return;
            }
        }

        const body = {
            name: trimmedName,
            establishment_type: formData.establishment_type,
            pet_rules: trimmedPetRules,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null
        };

        if (validatedAddress) {
            body.address = validatedAddress
            if (validatedCityId) {
                body.city_id = validatedCityId;
            }
            body.latitude = mapPosition.lat
            body.longitude = mapPosition.lng
        } else {
            body.city_id = validatedCityId;
        }

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
                    Authorization: `Bearer ${tokenPlace}`
                },
                body: JSON.stringify(body)
            });

            const responseJSON = await response.json();

            if (!response.ok) {
                const backendMessage = responseJSON.response || responseJSON.message || "Unknown backend error";
                setValidationMessage(backendMessage);
                setValidationMessageType("danger");
                return;
            }

            dispatch({
                type: "GET_PRIVATE_PLACE",
                payload: responseJSON
            });

            setFormData((currentData) => ({
                ...currentData,
                email: responseJSON.email || currentData.email,
                name: responseJSON.name || "",
                establishment_type: responseJSON.establishment_type || "",
                city_id: responseJSON.city?.id ? String(responseJSON.city.id) : "",
                address: responseJSON.address || "",
                place_id: "",
                pet_rules: responseJSON.pet_rules || "",
                start_time: responseJSON.start_time ? responseJSON.start_time.substring(0, 5) : "",
                end_time: responseJSON.end_time ? responseJSON.end_time.substring(0, 5) : ""
            }));

            alert("Profile updated successfully!");
            navigate("/places/private");
        } catch (error) {
            setValidationMessage("Unable to update the profile right now. Please try again.");
            setValidationMessageType("danger");
        }
    }

    if (!formData.email && !store.privatePlace?.id) {
        return <p className="text-center text-body-secondary mt-5">Loading profile...</p>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Edit Profile</h2>
            <form
                onSubmit={handleSubmit}
                className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
                style={{ maxWidth: 600 }}
            >
                <div className="mb-3">
                    <label htmlFor="placeEmail" className="form-label opacity-50">Email</label>
                    <input
                        id="placeEmail"
                        name="email"
                        type="email"
                        className="form-control"
                        value={formData.email}
                        disabled
                    />
                    <small className="form-text text-muted">Email cannot be changed.</small>
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                    <label htmlFor="placeName" className="form-label">Name *</label>
                    <input
                        id="placeName"
                        name="name"
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Establishment Type *</label>
                    <div className="form-check">
                        <input
                            id="establishmentTypeBar"
                            name="establishment_type"
                            type="radio"
                            className="form-check-input"
                            value="bar"
                            checked={formData.establishment_type === "bar"}
                            onChange={handleChange}
                            required
                        />
                        <label className="form-check-label" htmlFor="establishmentTypeBar">Bar</label>
                    </div>
                    <div className="form-check">
                        <input
                            id="establishmentTypeCafe"
                            name="establishment_type"
                            type="radio"
                            className="form-check-input"
                            value="cafe"
                            checked={formData.establishment_type === "cafe"}
                            onChange={handleChange}
                            required
                        />
                        <label className="form-check-label" htmlFor="establishmentTypeCafe">Cafe</label>
                    </div>
                    <div className="form-check">
                        <input
                            id="establishmentTypeRestaurant"
                            name="establishment_type"
                            type="radio"
                            className="form-check-input"
                            value="restaurant"
                            checked={formData.establishment_type === "restaurant"}
                            onChange={handleChange}
                            required
                        />
                        <label className="form-check-label" htmlFor="establishmentTypeRestaurant">Restaurant</label>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="startTime" className="form-label">Opening Time</label>
                        <input
                            type="time"
                            className="form-control"
                            id="startTime"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="endTime" className="form-label">Closing Time</label>
                        <input
                            type="time"
                            className="form-control"
                            id="endTime"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-12 mt-1">
                        <small className="text-muted">Set your operating hours so users can book correctly.</small>
                    </div>
                </div>

                <div className="mb-3 position-relative">
                    <label htmlFor="placeEditAddress" className="form-label">Address</label>
                    <div className="input-group">
                        <input
                            id="placeEditAddress"
                            name="address"
                            type="text"
                            className="form-control"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter address"
                            autoComplete="off"
                            onBlur={() => {
                                setTimeout(() => {
                                    setSuggestions([]);
                                }, 150);
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={handleRemoveLocation}
                        >
                            Remove location
                        </button>
                    </div>
                </div>
                {suggestions.length > 0 && (
                    <>
                        <ul className="list-group list-group-item-action bg-white w-100 position-absolute">
                            {suggestions.map((suggestion) => {
                                return <li key={suggestion.place_id} className="list-group-item list-group-item-action border-0 py-0 ps-1" style={{ cursor: "pointer" }} onClick={() => handleSuggestionClick(suggestion)}>{suggestion.description}</li>
                            })}
                        </ul>
                    </>
                )}

                {!formData.address.trim() && (
                    <div className="mb-3">
                        <label htmlFor="placeCity" className="form-label">Fallback city *</label>
                        <select
                            id="placeCity"
                            name="city_id"
                            className="form-select"
                            value={formData.city_id}
                            onChange={handleChange}
                            required={!formData.address.trim()}
                        >
                            <option value="">Select a city</option>
                            {store.cities.map((cityObj, index) => (
                                <option value={String(cityObj.id)} key={`${cityObj.city}-${index}`}>
                                    {cityObj.city}
                                </option>
                            ))}
                        </select>
                        <small className="form-text text-muted">Used only when no address is provided.</small>
                    </div>
                )}
                {validationMessage ? (
                    <div className={`alert alert-${validationMessageType} py-2`} role="alert">
                        {validationMessage}
                    </div>
                ) : null}

                <div className="mb-3">
                    <label htmlFor="petRules" className="form-label">Pet rules</label>
                    <textarea
                        id="petRules"
                        name="pet_rules"
                        className="form-control"
                        value={formData.pet_rules}
                        onChange={handleChange}
                        style={{ maxHeight: 250 }}
                        maxLength="250"
                    />
                </div>

                {mapPosition && (
                    <LocationMap
                        latitude={mapPosition.lat}
                        longitude={mapPosition.lng}
                        draggable
                        onPositionChange={setMapPosition}
                    />
                )}

                <p className="text-body-secondary small mb-4">* Required fields</p>

                <div className="mt-4 text-center">
                    <button type="submit" className="btn btn-warning me-3">Save Changes</button>
                    <Link to="/places/private" className="btn btn-outline-secondary">Cancel</Link>
                </div>
            </form>
            
            {store.privatePlace?.id && (
                <div className="mx-auto mt-4" style={{ maxWidth: 600 }}>
                    <PlaceScheduleManager placeId={store.privatePlace.id} />
                </div>
            )}
        </div>
    );
}

export default EditPrivatePlace;
