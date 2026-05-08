function UserReviewCard({ reviewObj }) {
    const { place_name, rating, title, content, created_at } = reviewObj;

    return (
        <div className="mb-3 mx-auto w-100" style={{
            maxWidth: 800,
            background: "var(--admin-surface)",
            border: "1px solid var(--admin-border)",
            borderRadius: "var(--admin-radius)",
            boxShadow: "var(--admin-shadow-sm)",
            padding: "16px 20px 20px",
        }}>
            <h5 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--admin-text)", borderBottom: "1px solid var(--admin-border)", paddingBottom: 10, marginBottom: 12 }}>
                {place_name}
            </h5>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 8 }}>
                <strong>Valoración:</strong>{" "}
                {[1, 2, 3, 4, 5].map((num) => (
                    <i key={num} className={`fa-star ${num <= rating ? "fa-solid" : "fa-regular"}`}
                        style={{ color: num <= rating ? "var(--admin-warning)" : "var(--admin-border)", marginLeft: 2 }} />
                ))}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 6 }}>
                <strong>Título:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{title}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 6 }}>
                <strong>Reseña:</strong> <span style={{ color: "var(--admin-text-muted)" }}>{content}</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginTop: 8 }}>
                {created_at}
            </div>
        </div>
    );
}

export default UserReviewCard;
