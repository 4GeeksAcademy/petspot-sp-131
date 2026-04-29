import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function EditPrivatePlace() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [validationMessage, setValidationMessage] = useState("");
    const [validationMessageType, setValidationMessageType] = useState("");
    const [isValidated, setIsValidated] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        establishment_type: "",
        city_id: "",
        address: "",
        pet_rules: ""
    });

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
                    pet_rules: store.privatePlace.pet_rules || ""
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
                    pet_rules: responseJSON.pet_rules || ""
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

    function handleChange(event) {
        const { name, value } = event.target;
        if (name === "address" || name === "city_id") {
            setValidationMessage("");
            setValidationMessageType("");
        }
        if (name === "address") {
            setIsValidated(false);
        }
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    }

    async function handleValidateAddress(event) {
        event.preventDefault();

        const trimmedAddress = formData.address.trim();
        if (!trimmedAddress) {
            setValidationMessage("Please enter an address first.");
            setValidationMessageType("danger");
            setIsValidated(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/geocode/place-address`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    address: trimmedAddress
                })
            });
            const responseJSON = await response.json();

            if (!response.ok) {
                const backendMessage = responseJSON.response || responseJSON.message || "Unknown backend error";
                setValidationMessage(backendMessage === "Invalid address" ? "Invalid address" : backendMessage);
                setValidationMessageType("danger");
                setIsValidated(false);
                return;
            }

            setFormData((currentData) => ({
                ...currentData,
                address: responseJSON.formatted_address || currentData.address,
                city_id: responseJSON.city_id ? String(responseJSON.city_id) : currentData.city_id
            }));

            if (responseJSON.city_id) {
                setValidationMessage(`Address validated. City updated to ${responseJSON.detected_city}.`);
                setValidationMessageType("success");
            } else {
                setValidationMessage("Address validated, but no matching city was found. Please review the city selection.");
                setValidationMessageType("warning");
            }
            setIsValidated(true);
        } catch (error) {
            setValidationMessage("Unable to validate the address right now. Please try again.");
            setValidationMessageType("danger");
            setIsValidated(false);
        }
    }

    function handleRemoveLocation(event) {
        event.preventDefault();
        setValidationMessage("");
        setValidationMessageType("");
        setIsValidated(false);
        setFormData((currentData) => ({
            ...currentData,
            address: ""
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedName = formData.name.trim();
        const trimmedCityId = formData.city_id.trim();
        const trimmedPetRules = formData.pet_rules.trim();
        const trimmedAddress = formData.address.trim();

        if (!trimmedName || !formData.establishment_type || !trimmedCityId) {
            alert("Please complete all required fields before submitting the form.");
            return;
        }

        if (trimmedPetRules.length > 250) {
            alert("Pet rules cannot exceed 250 characters.");
            return;
        }

        if (trimmedAddress && !isValidated) {
            setValidationMessage("Please validate the address before submitting.");
            setValidationMessageType("danger");
            return;
        }

        const body = {
            name: trimmedName,
            establishment_type: formData.establishment_type,
            city_id: trimmedCityId,
            pet_rules: trimmedPetRules
        };

        if (trimmedAddress) {
            body.address = trimmedAddress;
        }

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
                        Authorization: `Bearer ${tokenPlace}`
                    },
                    body: JSON.stringify(body)
                });
                const responseJSON = await response.json();

                if (!response.ok) {
                    const backendMessage = responseJSON.response || responseJSON.message || "Unknown backend error";
                    alert(`Error ${response.status}: ${backendMessage}`);
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
                    pet_rules: responseJSON.pet_rules || ""
                }));

                alert("Profile updated successfully!");
                navigate("/places/private");
            } catch (error) {
                alert("Unable to update the profile right now. Please try again.");
            }
        }

        updatePrivatePlace();
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

                <div className="mb-3">
                    <label htmlFor="placeCity" className="form-label">City *</label>
                    <select
                        id="placeCity"
                        name="city_id"
                        className="form-select"
                        value={formData.city_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a city</option>
                        {store.cities.map((cityObj, index) => (
                            <option value={String(cityObj.id)} key={`${cityObj.city}-${index}`}>
                                {cityObj.city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="p-3 bg-white d-flex flex-column mb-3">
                    <div className="mb-3">
                        <label htmlFor="placeEditAddress" className="form-label">Address</label>
                        <input
                            id="placeEditAddress"
                            name="address"
                            type="text"
                            className="form-control bg-secondary-subtle border-0"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter address"
                        />
                    </div>
                    {validationMessage ? (
                        <div className={`alert alert-${validationMessageType} py-2`} role="alert">
                            {validationMessage}
                        </div>
                    ) : null}
                    <div className="d-flex justify-content-center">

                    <button
                        type="button"
                        className="btn btn-sm btn-primary mt-2 me-2"
                        onClick={handleValidateAddress}
                    >
                        Validate address
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary mt-2"
                        onClick={handleRemoveLocation}
                    >
                        Remove location
                    </button>
                    </div>
                </div>

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

                <p className="text-body-secondary small mb-4">* Required fields</p>

                <div className="mt-4 text-center">
                    <button type="submit" className="btn btn-warning me-3">Save Changes</button>
                    <Link to="/places/private" className="btn btn-outline-secondary">Cancel</Link>
                </div>
            </form>
        </div>
    );
}

export default EditPrivatePlace;
