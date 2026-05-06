import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import LocationMap from "../../components/LocationMap";
import placeHero from "../../assets/img/places-hero.png";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function SignupPlace() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        establishment_type: "",
        city_id: "",
        address: "",
        place_id: "",
        pet_rules: ""
    });
    const [validationMessage, setValidationMessage] = useState("");
    const [validationMessageType, setValidationMessageType] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [addressSearchTerm, setAddressSearchTerm] = useState("");
    const [mapPosition, setMapPosition] = useState(null);

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
                throw new Error(`Place details request failed with status ${response.status}`);
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
        const trimmedPassword = formData.password.trim();
        const trimmedPlaceName = formData.name.trim();
        const trimmedPetRules = formData.pet_rules.trim();
        const trimmedAddress = formData.address.trim();
        const trimmedCityId = formData.city_id.trim();
        const trimmedPlaceId = formData.place_id.trim();

        if (!trimmedEmail || !trimmedPassword || !trimmedPlaceName || !formData.establishment_type) {
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
            password: trimmedPassword,
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
            const response = await fetch(`${backendUrl}/api/places`, {
                method: "POST",
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

            alert("Place registered successfully! Please log in.");
            navigate("/places/login");
        } catch (error) {
            setValidationMessage("Unable to sign up right now. Please try again.");
            setValidationMessageType("danger");
        }
    }

    return (
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-hero">
                    <h1 className="auth-hero-title">Place Account</h1>
                    <div className="auth-breadcrumb">
                        <Link to="/">Home</Link>
                        <span>&gt;</span>
                        <span>Register Place</span>
                    </div>

                    <div className="auth-hero-image">
                        <img src={placeHero} alt="Waiter with a dog" />
                    </div>
                </div>

                <div className="auth-panel">
                    <form onSubmit={handleSubmit} className="auth-card auth-card-large">
                        <h2 className="auth-title">Register your Place</h2>
                        <p className="auth-subtitle">Create an account for your business</p>

                        <div className="auth-field">
                            <label htmlFor="placeEmail">Email Address *</label>
                            <input id="placeEmail" name="email" onChange={handleChange} value={formData.email} type="email" required placeholder="Email Address" />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="placePassword">Password *</label>
                            <input id="placePassword" name="password" onChange={handleChange} value={formData.password} type="password" required placeholder="Password" />
                        </div>

                        <p className="auth-section-text">Fill in the place information below to complete the profile</p>

                        <div className="auth-field">
                            <label htmlFor="placeName">Place Name *</label>
                            <input id="placeName" name="name" onChange={handleChange} value={formData.name} type="text" required placeholder="Place name" />
                        </div>

                        <div className="auth-field">
                            <label>Establishment Type *</label>
                            <div className="auth-radio-group">
                                <label className="auth-radio"><input onChange={handleChange} checked={formData.establishment_type === "bar"} type="radio" name="establishment_type" value="bar" required /> Bar</label>
                                <label className="auth-radio"><input onChange={handleChange} checked={formData.establishment_type === "cafe"} type="radio" name="establishment_type" value="cafe" required /> Cafe</label>
                                <label className="auth-radio"><input onChange={handleChange} checked={formData.establishment_type === "restaurant"} type="radio" name="establishment_type" value="restaurant" required /> Restaurant</label>
                            </div>
                        </div>

                        <div className="auth-field position-relative">
                            <label htmlFor="placeAddress">Address</label>
                            <div className="input-group">
                                <input
                                    id="placeAddress"
                                    name="address"
                                    type="text"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter full address"
                                    autoComplete="off"
                                    onBlur={() => {
                                        setTimeout(() => {
                                            setSuggestions([]);
                                        }, 150);
                                    }}
                                />
                                <button type="button" className="auth-location-btn" onClick={handleRemoveLocation}>
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
                            <div className="auth-field">
                                <label htmlFor="placeCity">Fallback city *</label>
                                <select
                                    id="placeCity"
                                    name="city_id"
                                    onChange={handleChange}
                                    value={formData.city_id}
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

                        <div className="auth-field">
                            <label htmlFor="petRules">Pet Rules</label>
                            <textarea id="petRules" name="pet_rules" onChange={handleChange} value={formData.pet_rules} maxLength="250" placeholder="Optional rules"></textarea>
                        </div>

                        {mapPosition && (
                            <LocationMap
                                latitude={mapPosition.lat}
                                longitude={mapPosition.lng}
                                draggable
                                onPositionChange={setMapPosition}
                            />
                        )}

                        <div className="auth-actions">
                            <button type="submit" className="auth-btn">Register</button>
                            <Link to="/places/login" className="auth-secondary-btn">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SignupPlace;
