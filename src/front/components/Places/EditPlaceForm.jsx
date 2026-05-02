import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LocationMap from "../LocationMap";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditPlaceForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();
    const activePlace = store.places.find((place) => place.id === Number(id));
    const [validationMessage, setValidationMessage] = useState("");
    const [validationMessageType, setValidationMessageType] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        establishment_type: "",
        city_id: "",
        address: "",
        place_id: "",
        pet_rules: ""
    });
    const [mapPosition, setMapPosition] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [addressSearchTerm, setAddressSearchTerm] = useState("");

    useEffect(() => {
        if (activePlace) {
            setFormData({
                email: activePlace.email || "",
                name: activePlace.name || "",
                establishment_type: activePlace.establishment_type || "",
                city_id: activePlace.city?.id ? String(activePlace.city.id) : "",
                address: activePlace.address || "",
                place_id: "",
                pet_rules: activePlace.pet_rules || ""
            });
            setMapPosition(
                activePlace.latitude && activePlace.longitude
                    ? { lat: activePlace.latitude, lng: activePlace.longitude }
                    : null
            );
        }
    }, [activePlace]);

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
            setSuggestions([]);
            return;
        }

        async function loadSuggestions() {
            try {
                const response = await fetch(`${backendUrl}/api/autocomplete/address?input=${addressSearchTerm}`);
                if (!response.ok) {
                    throw new Error(`Suggestions request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                setSuggestions(responseJSON);
            } catch (error) {
                console.error("Unable to load suggestions");
            }
        }

        loadSuggestions();
    }, [addressSearchTerm]);

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

        if (name === "address") {
            setAddressSearchTerm(value);
            if (!value.trim()) {
                setMapPosition(null);
            }
        }
    }

    async function handleSuggestionClick(suggestion) {
        setFormData((currentData) => ({
            ...currentData,
            address: suggestion.description,
            place_id: suggestion.place_id
        }));
        setAddressSearchTerm("");
        setSuggestions([]);

        try {
            const response = await fetch(`${backendUrl}/api/places/details?place_id=${suggestion.place_id}`);
            if (!response.ok) {
                throw new Error(`Suggestions request failed with status ${response.status}`);
            }

            const data = await response.json();
            setMapPosition({
                lat: data.lat,
                lng: data.lng
            });
        } catch (error) {
            console.error("Unable to load lat/lng");
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
        setMapPosition(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedEmail = formData.email.trim();
        const trimmedPlaceName = formData.name.trim();
        const trimmedPetRules = formData.pet_rules.trim();
        const trimmedCityId = formData.city_id.trim();
        const trimmedAddress = formData.address.trim();
        const trimmedPlaceId = formData.place_id.trim();

        if (!trimmedEmail || !trimmedPlaceName || !formData.establishment_type) {
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
        const manualLatitude = mapPosition?.lat ?? null;
        const manualLongitude = mapPosition?.lng ?? null;
        let resolvedLatitude = manualLatitude;
        let resolvedLongitude = manualLongitude;

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
                resolvedLatitude = manualLatitude ?? validationResponseJSON.latitude ?? null;
                resolvedLongitude = manualLongitude ?? validationResponseJSON.longitude ?? null;

                setFormData((currentData) => ({
                    ...currentData,
                    address: validatedAddress,
                    city_id: validatedCityId || currentData.city_id,
                    place_id: trimmedPlaceId
                }));
                if (resolvedLatitude !== null && resolvedLongitude !== null) {
                    setMapPosition({
                        lat: resolvedLatitude,
                        lng: resolvedLongitude
                    });
                }
                setValidationMessage("");
                setValidationMessageType("");
            } catch (error) {
                setValidationMessage("Unable to validate the address right now. Please try again.");
                setValidationMessageType("danger");
                return;
            }
        }

        if (validatedAddress && (resolvedLatitude === null || resolvedLongitude === null)) {
            setValidationMessage("Unable to resolve coordinates for the provided address.");
            setValidationMessageType("danger");
            return;
        }

        const body = {
            email: trimmedEmail,
            name: trimmedPlaceName,
            establishment_type: formData.establishment_type,
            pet_rules: trimmedPetRules
        };

        if (validatedAddress) {
            body.address = validatedAddress;
            if (validatedCityId) {
                body.city_id = validatedCityId;
            }
            body.latitude = resolvedLatitude;
            body.longitude = resolvedLongitude;
        } else {
            body.city_id = validatedCityId;
        }

        try {
            const response = await fetch(`${backendUrl}/api/places/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
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
                type: "UPDATE_PLACE",
                payload: responseJSON
            });

            setFormData({
                email: responseJSON.email || "",
                name: responseJSON.name || "",
                establishment_type: responseJSON.establishment_type || "",
                city_id: responseJSON.city?.id ? String(responseJSON.city.id) : "",
                address: responseJSON.address || "",
                place_id: "",
                pet_rules: responseJSON.pet_rules || ""
            });
            setMapPosition(
                responseJSON.latitude && responseJSON.longitude
                    ? { lat: responseJSON.latitude, lng: responseJSON.longitude }
                    : null
            );

            navigate("/places");
        } catch (error) {
            setValidationMessage("Unable to update the place right now. Please try again.");
            setValidationMessageType("danger");
        }
    }

    if (!activePlace && store.places.length > 0) {
        return <p className="text-center text-body-secondary">Place not found.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="placeEmail" className="form-label">Email *</label>
                <input
                    id="placeEmail"
                    name="email"
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="placePassword" className="form-label opacity-50 fst-italic">Password</label>
                <input disabled value="" type="password" className="form-control" id="placePassword" name="password" />
            </div>
            <hr className="my-4" />
            <p className="text-body-secondary mb-4 text-center">
                Fill in the place information below to complete the profile
            </p>
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
                    <input id="establishmentTypeBar" name="establishment_type" onChange={handleChange} checked={formData.establishment_type === "bar"} className="form-check-input" type="radio" value="bar" required />
                    <label className="form-check-label" htmlFor="establishmentTypeBar">Bar</label>
                </div>
                <div className="form-check">
                    <input id="establishmentTypeCafe" name="establishment_type" onChange={handleChange} checked={formData.establishment_type === "cafe"} className="form-check-input" type="radio" value="cafe" required />
                    <label className="form-check-label" htmlFor="establishmentTypeCafe">Cafe</label>
                </div>
                <div className="form-check">
                    <input id="establishmentTypeRestaurant" name="establishment_type" onChange={handleChange} checked={formData.establishment_type === "restaurant"} className="form-check-input" type="radio" value="restaurant" required />
                    <label className="form-check-label" htmlFor="establishmentTypeRestaurant">Restaurant</label>
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
                    <button type="button" className="btn btn-sm btn-secondary" onClick={handleRemoveLocation}>
                        Remove location
                    </button>
                </div>
            </div>

            {suggestions.length > 0 && (
                <ul className="list-group list-group-item-action bg-white w-100 position-absolute">
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            className="list-group-item list-group-item-action border-0 py-0 ps-1"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.description}
                        </li>
                    ))}
                </ul>
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
            <div className="mt-5 text-center">
                <button type="submit" className="btn btn-success me-3 mx-auto">Submit</button>
                <Link to="/places" className="btn btn-outline-secondary">Cancel</Link>
            </div>
        </form>
    );
}

export default EditPlaceForm;
