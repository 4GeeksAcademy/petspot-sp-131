import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import toTitleCase from "../../utils/toTitleCase";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function AddCityForm() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        city: "",
        address: "",
        latitude: "",
        longitude: ""
    });
    const [validationMessage, setValidationMessage] = useState("");
    const [validationMessageType, setValidationMessageType] = useState("");
    const [isValidated, setIsValidated] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
        setIsValidated(false);
        setValidationMessage("");
        setValidationMessageType("");
    }

    async function handleValidateCity(event) {
        event.preventDefault();

        const trimmedCityName = formData.city.trim();
        if (!trimmedCityName) {
            setValidationMessage("Please enter a city name.");
            setValidationMessageType("danger");
            return;
        }

        const formattedCityName = toTitleCase(trimmedCityName);
        const cityAlreadyExists = store.cities.some((city) => city.city.toLowerCase() === formattedCityName.toLowerCase());
        if (cityAlreadyExists) {
            setValidationMessage("City already exists");
            setValidationMessageType("danger");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/geocode/city`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    city: formattedCityName
                })
            });
            const responseJSON = await response.json();

            if (!response.ok) {
                const backendMessage = responseJSON.response || responseJSON.message || "Unable to validate the city right now.";
                setValidationMessage(backendMessage);
                setValidationMessageType("danger");
                setIsValidated(false);
                return;
            }

            setFormData({
                city: responseJSON.city || formattedCityName,
                address: responseJSON.formatted_address || "",
                latitude: responseJSON.latitude ?? "",
                longitude: responseJSON.longitude ?? ""
            });
            setValidationMessage(responseJSON.formatted_address || "City validated successfully.");
            setValidationMessageType("success");
            setIsValidated(true);
        } catch (error) {
            setValidationMessage("Unable to validate the city right now. Please try again.");
            setValidationMessageType("danger");
            setIsValidated(false);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!isValidated) {
            setValidationMessage("Please validate the city before submitting.");
            setValidationMessageType("danger");
            return;
        }

        const body = {
            city: formData.city.trim(),
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude
        };

        async function addCity() {
            try {
                const response = await fetch(`${backendUrl}/api/cities`, {
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

                dispatch({
                    type: "ADD_CITY",
                    payload: responseJSON
                });
                navigate("/cities");
            } catch (error) {
                setValidationMessage("Unable to add the city right now. Please try again.");
                setValidationMessageType("danger");
            }
        }

        addCity();
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="cityName" className="form-label">City Name *</label>
                <div className="d-flex gap-2">
                    <input
                        id="cityName"
                        name="city"
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                        maxLength="120"
                        required
                    />
                    <button type="button" className="btn btn-primary flex-shrink-0" onClick={handleValidateCity}>
                        Validate city
                    </button>
                </div>
            </div>

            {validationMessage ? (
                <div className={`alert alert-${validationMessageType} py-2`} role="alert">
                    {validationMessage}
                </div>
            ) : null}

            {formData.address ? (
                <div className="mb-3">
                    <label className="form-label">Validated address</label>
                    <div className="form-control bg-light">{formData.address}</div>
                </div>
            ) : null}

            <p className="text-body-secondary small mb-4">* Required field</p>
            <div className="mt-5">
                <button type="submit" className="btn btn-success d-block mx-auto" disabled={!isValidated}>
                    Submit
                </button>
            </div>
        </form>
    );
}

export default AddCityForm;
