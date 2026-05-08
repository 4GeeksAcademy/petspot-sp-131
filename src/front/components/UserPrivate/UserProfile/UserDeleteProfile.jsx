import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserDeleteProfile() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        loadPrivateUser();
    }, [dispatch, store.privateUser?.id]);

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
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-trash me-2" style={{ color: "var(--admin-danger)" }} />
                Eliminar cuenta
            </h5>
            <div style={{
                maxWidth: 700,
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: "var(--admin-shadow-sm)",
                padding: "28px 32px",
            }}>
                <p style={{ marginBottom: 8, fontWeight: 600, color: "var(--admin-danger)", fontSize: "0.9rem" }}>
                    Atención: esta acción eliminará permanentemente tu cuenta.
                </p>
                <p style={{ marginBottom: 0, color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>
                    Una vez eliminada, perderás acceso al área privada de usuario de forma inmediata.
                </p>

                <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                    <Link to="/user/private/profile" style={{
                        background: "transparent", color: "var(--admin-text-muted)",
                        border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                        padding: "7px 20px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                    }}>
                        Volver a mi perfil
                    </Link>
                    <button type="button" onClick={handleDeleteAccount} style={{
                        background: "var(--admin-danger)", color: "#fff", border: "none",
                        borderRadius: "var(--admin-radius-sm)", padding: "7px 20px",
                        fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                    }}>
                        Eliminar cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserDeleteProfile;
