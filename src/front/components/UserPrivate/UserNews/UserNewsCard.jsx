import { Link } from "react-router-dom";

function UserNewsCard({newsObj}) {

    const {
        content,
        post_date,
        post_type,
        title,
        id
    } = newsObj

    const postTypeEmoji = {
        normative: "⚠️",
        news: "📰",
        event: "📆"
    }

    return (
        <>
            <div className="mb-3 mx-auto w-100" style={{
                maxWidth: 800,
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: "var(--admin-shadow-sm)",
                overflow: "hidden"
            }}>
                <div className="card-body p-4">
                    <h5 style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--admin-text)", borderBottom: "1px solid var(--admin-border)", paddingBottom: 12, marginBottom: 12 }}>
                        {title}
                    </h5>
                    <div style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)", marginBottom: 8 }}>
                        {postTypeEmoji[post_type]}
                        <span style={{ fontStyle: "italic", marginLeft: 4 }}>{post_type}</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
                        🕑 {post_date}
                    </div>
                    <p style={{ color: "var(--admin-text)", fontSize: "0.9rem", marginBottom: 16 }}>{content}</p>
                    <div className="d-flex justify-content-end">
                        <Link
                            to={`/user/private/news/${id}`}
                            style={{
                                background: "var(--admin-primary-soft)",
                                color: "var(--admin-primary)",
                                border: "1px solid var(--admin-border)",
                                borderRadius: "var(--admin-radius-sm)",
                                padding: "5px 14px",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Read more…
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserNewsCard;