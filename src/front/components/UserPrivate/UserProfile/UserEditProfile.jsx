import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { getPrivateUser } from "../../../services/userPrivateService";
import LocationMap from "../../LocationMap";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserEditProfile() {
    const { store, dispatch } = useGlobalReducer();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: ""
    });
    const [suggestions, setSuggestions] = useState([])
    const [addressSearchTerm, setAddressSearchTerm] = useState("");
    const [mapPosition, setMapPosition] = useState({
        lat: store.privateUser?.latitude || null,
        lng: store.privateUser?.longitude || null
    })
    const navigate = useNavigate()

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                setFormData((currentData) => ({
                    ...currentData,
                    name: store.privateUser.name,
                    email: store.privateUser.email,
                    address: store.privateUser.address || ""
                }));
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
                setFormData((currentData) => ({
                    ...currentData,
                    name: responseJSON.name || "",
                    email: responseJSON.email || "",
                    address: responseJSON.address || ""
                }));
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        loadPrivateUser();
    }, [dispatch, store.privateUser]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));

        if (event.target.name === "address") {
            setAddressSearchTerm(value);
        }
    }

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

    async function handleSuggestionClick(suggestion) {
        setFormData((currentData) => ({
            ...currentData,
            address: suggestion.description
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
        event.preventDefault()
        setFormData((currentData) => ({
            ...currentData,
            address: ""
        }))
        setAddressSearchTerm("")
        setMapPosition(null)
    }

    function handleSubmit(event) {
        event.preventDefault();
        const userToken = localStorage.getItem("userToken");

        async function updatePrivateUser() {
            try {
                const trimmedPassword = formData.password.trim();
                const trimmedAddress = formData.address.toString().trim();

                const body = {
                    name: formData.name.trim(),
                    email: formData.email.trim()
                };

                if (trimmedPassword) {
                    body.password = trimmedPassword;
                }

                if (trimmedAddress) {
                    body.address = trimmedAddress
                    body.latitude = mapPosition.lat
                    body.longitude = mapPosition.lng
                } else {
                    body.address = ""
                }

                const response = await fetch(`${backendUrl}/api/users/private`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`
                    },
                    body: JSON.stringify(body)
                });

                const responseJSON = await response.json();

                if (!response.ok) {
                    alert(responseJSON.response || "Unable to update your profile.");
                    return;
                }

                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });

                setFormData((currentData) => ({
                    ...currentData,
                    password: ""
                }));

                alert("Profile updated successfully.");
                navigate('/user/private/profile', { replace: true });

            } catch (error) {
                alert("Unable to update your profile right now. Please try again.");
            }
        }

        updatePrivateUser();
    }

    return (
        <>
            <div>
                <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                    <i className="fa-solid fa-pen me-2" style={{ color: "var(--admin-primary)" }} />
                    Editar perfil
                </h5>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        maxWidth: 700,
                        background: "var(--admin-surface)",
                        border: "1px solid var(--admin-border)",
                        borderRadius: "var(--admin-radius)",
                        boxShadow: "var(--admin-shadow-sm)",
                        padding: "28px 32px",
                    }}
                >
                    <div className="mb-3">
                        <label htmlFor="userEditName" className="form-label">Name *</label>
                        <input
                            id="userEditName"
                            name="name"
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="userEditEmail" className="form-label">Email *</label>
                        <input
                            id="userEditEmail"
                            name="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="userEditPassword" className="form-label">Password</label>
                        <input
                            id="userEditPassword"
                            name="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter a new password"
                        />
                    </div>

                    <div className="mb-3 position-relative">
                        <label htmlFor="userEditAddress" className="form-label">Address</label>
                        <div className="input-group">
                            <input
                                id="userEditAddress"
                                name="address"
                                type="text"
                                className="form-control "
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
                            <button className="btn btn-sm btn-secondary border border-subtle" onClick={handleRemoveLocation}>Remove location</button>
                        </div>
                    </div>

                    {suggestions.length > 0 && (
                        <>
                            <ul className="list-group list-group-item-action position-absolute bg-white w-100">
                                {suggestions.map((suggestion) => {
                                    return <li key={suggestion.place_id} className="list-group-item list-group-item-action border-0 py-0 ps-1" style={{ cursor: "pointer" }} onClick={() => handleSuggestionClick(suggestion)}>{suggestion.description}</li>
                                })}
                            </ul>
                        </>
                    )}

                    <p className="text-body-secondary small mb-4">* Required fields</p>

                    {mapPosition && (
                        <LocationMap
                            latitude={mapPosition.lat}
                            longitude={mapPosition.lng}
                            draggable
                            onPositionChange={setMapPosition}
                        />
                    )}

                    <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                        <button type="submit" style={{
                            background: "var(--admin-success)", color: "#fff", border: "none",
                            borderRadius: "var(--admin-radius-sm)", padding: "7px 20px",
                            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                        }}>Guardar cambios</button>
                        <Link to="/user/private/profile" style={{
                            background: "transparent", color: "var(--admin-text-muted)",
                            border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                            padding: "7px 20px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                        }}>
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}

export default UserEditProfile;
