import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getPrivateUser } from "../../../services/userPrivateService";
import LocationMap from "../../LocationMap";

function UserProfileCard() {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) return;
            try {
                const responseJSON = await getPrivateUser();
                dispatch({ type: "GET_PRIVATE_USER", payload: responseJSON });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }
        loadPrivateUser();
    }, [dispatch, store.privateUser?.id]);

    if (!store.privateUser?.id) {
        return (
            <p style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "20px 0" }}>
                Cargando perfil…
            </p>
        );
    }

    const u = store.privateUser;

    return (
        <div style={{
            maxWidth: 700, margin: "0 auto",
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "24px",
        }}>
            <div style={{ marginBottom: 10, fontSize: "0.9rem", color: "var(--admin-text)" }}>
                <strong>Nombre:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{u.name}</span>
            </div>
            <div style={{ marginBottom: 10, fontSize: "0.9rem", color: "var(--admin-text)" }}>
                <strong>Email:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{u.email}</span>
            </div>
            <div style={{ marginBottom: 10, fontSize: "0.9rem", color: "var(--admin-text)" }}>
                <strong>Mascotas:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{u.pets?.length || 0}</span>
                {u.pets?.length > 0 && (
                    <div style={{ marginTop: 6, paddingLeft: 8 }}>
                        {u.pets.map((pet) => (
                            <div key={pet.id} style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginBottom: 2 }}>
                                {pet.animal_type} · {pet.name} · {pet.race_name || pet.other_type || pet.animal_type}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {u.latitude && u.longitude && (
                <div style={{ marginBottom: 16, fontSize: "0.9rem", color: "var(--admin-text)" }}>
                    <strong>Dirección:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{u.address}</span>
                </div>
            )}
            <LocationMap latitude={u.latitude} longitude={u.longitude} label="User location" />
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                <Link to="/user/private/pets" style={{
                    background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                    border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                    padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>Mascotas</Link>
                <Link to="/user/private/profile/edit" style={{
                    background: "rgba(123,160,91,0.12)", color: "var(--admin-success)",
                    border: "1px solid rgba(123,160,91,0.3)", borderRadius: "var(--admin-radius-sm)",
                    padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>Editar perfil</Link>
                <Link to="/user/private/profile/delete" style={{
                    background: "rgba(184,84,80,0.08)", color: "var(--admin-danger)",
                    border: "1px solid rgba(184,84,80,0.25)", borderRadius: "var(--admin-radius-sm)",
                    padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>Eliminar cuenta</Link>
            </div>
        </div>
    );
}

export default UserProfileCard;
