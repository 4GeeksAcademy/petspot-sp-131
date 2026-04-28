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
        password: ""
    });
    const navigate = useNavigate()

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                setFormData((currentData) => ({
                    ...currentData,
                    name: store.privateUser.name || "",
                    email: store.privateUser.email || ""
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
                    email: responseJSON.email || ""
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

    function handleSubmit(event) {
        event.preventDefault();
        const userToken = localStorage.getItem("userToken");

        async function updatePrivateUser() {
            try {
                const trimmedPassword = formData.password.trim();
                const body = {
                    name: formData.name.trim(),
                    email: formData.email.trim()
                };

                if (trimmedPassword) {
                    body.password = trimmedPassword;
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
                    alert(responseJSON.msg || responseJSON.message || "Unable to update your profile.");
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
