import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserEditProfile() {
    const { store, dispatch } = useGlobalReducer();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        latitude: "",
        longitude: ""
    });
    const navigate = useNavigate()

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                setFormData((currentData) => ({
                    ...currentData,
                    name: store.privateUser.name,
                    email: store.privateUser.email,
                    latitude: store.privateUser.latitude || "",
                    longitude: store.privateUser.longitude || ""
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
                    latitude: store.privateUser.latitude,
                    longitude: store.privateUser.longitude
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
    }

    function handleRemoveLocation(event) {
        event.preventDefault()
        setFormData((currentData) => ({
            ...currentData,
            latitude: "",
            longitude: ""
        }))
    }

    function handleSubmit(event) {
        event.preventDefault();
        const userToken = localStorage.getItem("userToken");

        async function updatePrivateUser() {
            try {
                const trimmedPassword = formData.password.trim();
                const trimmedLatitude = formData.latitude.toString().trim();
                const trimmedLongitude = formData.longitude.toString().trim();

                const body = {
                    name: formData.name.trim(),
                    email: formData.email.trim()
                };

                if (trimmedPassword) {
                    body.password = trimmedPassword;
                }

                if (trimmedLatitude && trimmedLongitude) {
                    body.latitude = trimmedLatitude
                    body.longitude = trimmedLongitude
                } else if (trimmedLatitude || trimmedLongitude) {
                    alert("Latitude and longitude must both exist")
                    return
                } else {
                    body.latitude = ""
                    body.longitude = ""
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
                navigate('/user/private/profile', {replace: true});

            } catch (error) {
                alert("Unable to update your profile right now. Please try again.");
            }
        }

        updatePrivateUser();
    }

    return (
        <>
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">Edit Profile</h1>
                <div className="text-center my-5">
                    <Link to="/user/private/profile" className="btn btn-secondary">
                        Go Back to My Profile
                    </Link>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
                    style={{ maxWidth: 700 }}
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

                    <div className="p-3 bg-white d-flex flex-column mb-3">
                        <div className="row mb-3 ">
                            <div className="col">
                                <label htmlFor="userEditLatitude" className="form-label">Latitude</label>
                                <input
                                    id="userEditLatitude"
                                    name="latitude"
                                    type="number"
                                    className="form-control bg-secondary-subtle border-0"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    placeholder="Enter latitude"
                                />
                            </div>
                            <div className="col">
                                <label htmlFor="userEditLongitude" className="form-label">Longitude</label>
                                <input
                                    id="userEditLongitude"
                                    name="longitude"
                                    type="number"
                                    className="form-control bg-secondary-subtle border-0"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    placeholder="Enter longitude"
                                />
                            </div>
                        </div>
                        <button className="btn btn-sm btn-outline-secondary mt-2" onClick={handleRemoveLocation}>Remove location</button>
                    </div>

                    <p className="text-body-secondary small mb-4">* Required fields</p>

                    <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                        <button type="submit" className="btn btn-success">Save Changes</button>
                        <Link to="/user/private/profile" className="btn btn-outline-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </>
    )
}

export default UserEditProfile;
