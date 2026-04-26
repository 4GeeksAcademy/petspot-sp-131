import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserDeleteProfile() {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    async function handleDeleteAccount() {
        try {
            const userToken = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/users/private`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                alert("Unable to delete your account right now. Please try again.");
                return;
            }

            localStorage.removeItem("userToken");
            dispatch({
                type: "USER_LOGOUT"
            });
            navigate("/", { replace: true });
        } catch (error) {
            alert("Unable to delete your account right now. Please try again.");
        }
    }

    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">Delete Account</h1>
            <div
                className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
                style={{ maxWidth: 700 }}
            >
                <p className="mb-3 fw-semibold text-danger">
                    Warning: this action will permanently delete your account.
                </p>
                <p className="mb-0">
                    Once your account is deleted, your access to the private user area will be removed immediately.
                </p>

                <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                    <Link to="/user/private/profile" className="btn btn-outline-secondary">
                        Go Back to My Profile
                    </Link>
                    <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserDeleteProfile;
