import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { deletePet, getPetById, getPrivateUser } from "../../../services/userPrivateService";

function UserDeletePetCard() {
    const { id } = useParams();
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadPet() {
            try {
                const petResponse = await getPetById(id);
                setPet(petResponse);
            } catch (error) {
                alert("Unable to load this pet right now. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        loadPet();
    }, [id]);

    async function handleDeletePet() {
        setIsDeleting(true);

        try {
            await deletePet(id);
            const privateUser = await getPrivateUser();
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: privateUser
            });
            navigate("/user/private/pets", { replace: true });
        } catch (error) {
            alert(error.message || "Unable to delete this pet right now. Please try again.");
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <p style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "20px 0" }}>
                Cargando…
            </p>
        );
    }

    return (
        <div style={{
            maxWidth: 700, margin: "0 auto",
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "28px 32px",
        }}>
            <p style={{ marginBottom: 8, fontWeight: 600, color: "var(--admin-danger)", fontSize: "0.9rem" }}>
                Atención: esta acción eliminará permanentemente {pet?.name ? `"${pet.name}"` : "esta mascota"}.
            </p>
            <p style={{ marginBottom: 0, color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>
                Una vez eliminada, la mascota se borrará de tu perfil y del área privada.
            </p>

            <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                <Link to="/user/private/pets" style={{
                    background: "transparent", color: "var(--admin-text-muted)",
                    border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                    padding: "7px 20px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>
                    Volver a mascotas
                </Link>
                <button type="button" onClick={handleDeletePet} disabled={isDeleting} style={{
                    background: "var(--admin-danger)", color: "#fff", border: "none",
                    borderRadius: "var(--admin-radius-sm)", padding: "7px 20px",
                    fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                }}>
                    {isDeleting ? "Eliminando..." : "Eliminar mascota"}
                </button>
            </div>
        </div>
    );
}

export default UserDeletePetCard;
