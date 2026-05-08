import { Link } from "react-router-dom";

const statusStyle = {
    confirmed: { bg: "rgba(255,255,255,0.9)", color: "#5a8a3a", border: "rgba(255,255,255,0.6)" },
    pending: { bg: "rgba(255,255,255,0.9)", color: "#b07a3a", border: "rgba(255,255,255,0.6)" },
    cancelled: { bg: "rgba(255,255,255,0.9)", color: "#b85450", border: "rgba(255,255,255,0.6)" },
};

function UserReservationCard({ reservationObj, onCancelReservation }) {
    const {
        id,
        place_name,
        notes,
        zone_preference,
        people_count,
        pet_name,
        reservation_date,
        reservation_time,
        status,
        place_id
    } = reservationObj;

    const st = statusStyle[status] || statusStyle.pending;

    return (
        <div className="mb-3 mx-auto w-100" style={{
            maxWidth: 800,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            overflow: "hidden",
        }}>
            <div style={{ display: "flex" }}>
                <div style={{
                    minWidth: 120, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "var(--admin-primary)", color: "#fff",
                    padding: "20px 16px", gap: 4,
                }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>
                        {reservation_time?.substring(0, 5)}
                    </div>
                    <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>{reservation_date}</div>
                    <span style={{
                        marginTop: 8, background: st.bg, color: st.color,
                        border: `1px solid ${st.border}`, borderRadius: "var(--admin-radius-sm)",
                        padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}>
                        {status}
                    </span>
                </div>

                <div style={{ flex: 1, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <h5 style={{ fontWeight: 700, color: "var(--admin-text)", margin: 0, fontSize: "1.05rem" }}>{place_name}</h5>
                        <Link to={`/user/private/places/view/${place_id}`} style={{
                            color: "var(--admin-primary)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
                        }}>
                            Ver lugar →
                        </Link>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                            <i className="fas fa-users me-1" style={{ color: "var(--admin-primary)" }} />
                            {people_count} personas
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                            <i className="fas fa-paw me-1" style={{ color: "var(--admin-primary)" }} />
                            {pet_name || "Sin mascota"}
                        </div>
                        {zone_preference && (
                            <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>
                                <i className="fas fa-layer-group me-1" style={{ color: "var(--admin-primary)" }} />
                                {zone_preference}
                            </div>
                        )}
                    </div>

                    {notes && (
                        <div style={{
                            background: "var(--admin-bg)", borderLeft: "3px solid var(--admin-primary)",
                            borderRadius: "0 var(--admin-radius-sm) var(--admin-radius-sm) 0",
                            padding: "8px 12px", marginBottom: 12, fontSize: "0.8rem",
                            color: "var(--admin-text-muted)", fontStyle: "italic",
                        }}>
                            "{notes}"
                        </div>
                    )}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: "1px solid var(--admin-border)", paddingTop: 12, justifyContent: "flex-end" }}>
                        {status === "confirmed" && (
                            <Link to={`/user/private/reviews/add/${id}`} style={{
                                background: "rgba(212,165,116,0.12)", color: "var(--admin-warning)",
                                border: "1px solid rgba(212,165,116,0.35)", borderRadius: "var(--admin-radius-sm)",
                                padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none",
                            }}>
                                <i className="fas fa-star me-1" /> Reseña
                            </Link>
                        )}
                        <Link to={`/user/private/chats?id=${place_id}&name=${encodeURIComponent(place_name)}`} style={{
                            background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                            border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                            padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600, textDecoration: "none",
                        }}>
                            <i className="fas fa-comment me-1" /> Chat
                        </Link>
                        {status !== "cancelled" && (
                            <button type="button" onClick={() => onCancelReservation(id)} style={{
                                background: "rgba(184,84,80,0.08)", color: "var(--admin-danger)",
                                border: "1px solid rgba(184,84,80,0.25)", borderRadius: "var(--admin-radius-sm)",
                                padding: "4px 12px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                            }}>
                                <i className="fas fa-times me-1" /> Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserReservationCard;
