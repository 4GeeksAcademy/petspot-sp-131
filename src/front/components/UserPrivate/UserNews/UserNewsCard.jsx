import { Link } from "react-router-dom";

const postTypeEmoji = { normative: "⚠️", news: "📰", event: "📆" };

function UserNewsCard({ newsObj }) {
    const { content, post_date, post_type, title, id } = newsObj;

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
                {title}
            </h5>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 6 }}>
                {postTypeEmoji[post_type]} <span style={{ fontStyle: "italic" }}>{post_type}</span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginBottom: 12 }}>
                🕑 {post_date}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--admin-text)", marginBottom: 16 }}>{content}</p>
            <div className="d-flex justify-content-end">
                <Link to={`/user/private/news/${id}`} style={{
                    background: "var(--admin-primary-soft)", color: "var(--admin-primary)",
                    border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius-sm)",
                    padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none",
                }}>Leer más</Link>
            </div>
        </div>
    );
}

export default UserNewsCard;
