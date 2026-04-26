import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserProfileCard() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const userToken = localStorage.getItem("userToken");

                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        getPrivateUser();
    }, [dispatch, store.privateUser?.id]);

    if (!store.privateUser?.id) {
        return (
            <p className="text-center text-body-secondary alert alert-secondary mx-auto" style={{ maxWidth: 600 }}>
                Loading your profile...
            </p>
        );
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 700 }}>
            <div className="mb-3">
                <span className="fw-bold">Name: </span>{store.privateUser.name}
            </div>
            <div className="mb-4">
                <span className="fw-bold">Email: </span>{store.privateUser.email}
            </div>
            <div className="d-grid d-sm-flex gap-2 justify-content-sm-center mt-5">
                <Link to="/user/private/profile/edit" className="btn btn-outline-success">Edit profile</Link>
                <Link to="/user/private/profile/delete" className="btn btn-outline-danger">Delete account</Link>
            </div>
        </div>
    );
}

export default UserProfileCard;
