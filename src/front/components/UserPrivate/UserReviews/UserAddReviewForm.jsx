import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { getPrivateUser } from "../../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserAddReviewForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [reservation, setReservation] = useState(store.privateUser?.reservations?.find((reservation) => reservation.id === Number(id)) || null);

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

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!rating || !trimmedTitle || !trimmedContent) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }

        try {
            const userToken = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/users/private/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    reservation_id: id.toString(),
                    rating: rating.toString(),
                    title: trimmedTitle,
                    content: trimmedContent
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error ${response.status}: ${errorData.response || errorData.message || "Error desconocido"}`);
                return;
            }

            navigate("/user/private/reviews");
        } catch (error) {
            alert("Unable to add the review right now. Please try again.");
        }
    }

    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-star me-2" style={{ color: "var(--admin-warning)" }} />
                Escribir reseña
            </h5>
            <form onSubmit={handleSubmit} style={{
                maxWidth: 600,
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: "var(--admin-shadow-sm)",
                padding: "28px 32px",
            }}>
                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Lugar</label>
                    <input
                        type="text"
                        className="form-control"
                        value={reservation ? reservation.place_name : `Reserva #${id}`}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label d-block" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Valoración *</label>
                    <div className="d-flex gap-2" style={{ fontSize: "1.4rem" }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <i
                                key={num}
                                className={`fa-star ${num <= rating ? "fa-solid" : "fa-regular"}`}
                                style={{ cursor: "pointer", color: num <= rating ? "var(--admin-warning)" : "var(--admin-border)" }}
                                onClick={() => setRating(num)}
                            />
                        ))}
                    </div>
                    <input type="hidden" value={rating} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="reviewTitle" className="form-label" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Título *</label>
                    <input id="reviewTitle" type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="reviewContent" className="form-label" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Reseña *</label>
                    <textarea id="reviewContent" className="form-control" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginBottom: 20 }}>* Campos obligatorios</p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button type="submit" style={{
                        background: "var(--admin-success)", color: "#fff", border: "none",
                        borderRadius: "var(--admin-radius-sm)", padding: "7px 24px",
                        fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                    }}>Enviar reseña</button>
                    <Link to="/user/private/reservations" style={{
                        background: "transparent", color: "var(--admin-text-muted)",
                        border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                        padding: "7px 20px", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                    }}>Cancelar</Link>
                </div>
            </form>
        </div>
    );
}

export default UserAddReviewForm;
