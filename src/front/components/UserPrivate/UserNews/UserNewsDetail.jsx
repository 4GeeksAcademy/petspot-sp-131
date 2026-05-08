import { useParams, Link } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserNewsDetail() {
    const { id } = useParams();
    const { store, dispatch } = useGlobalReducer();
    const activeNews = store.news.find((news) => news.id === Number(id));

    useEffect(() => {
        async function getNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news`);
                if (!response.ok) { alert(`Request failed with status ${response.status}`); return; }
                const responseJSON = await response.json();
                dispatch({ type: "GET_NEWS", payload: responseJSON });
            } catch (error) {
                alert("Unable to load news right now. Please try again.");
            }
        }
        getNews();
    }, []);

    if (!activeNews) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "var(--admin-danger)", fontSize: "0.9rem" }}>Noticia no encontrada.</p>
                <Link to="/user/private/news" style={{
                    color: "var(--admin-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>← Volver a noticias</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: "var(--admin-shadow-sm)",
                padding: "28px 32px",
            }}>
                <h2 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 8 }}>{activeNews.title}</h2>
                <p style={{ fontSize: "0.82rem", color: "var(--admin-text-muted)", marginBottom: 20 }}>🕑 {activeNews.post_date}</p>
                <p style={{ color: "var(--admin-text)", lineHeight: 1.7, borderTop: "1px solid var(--admin-border)", paddingTop: 20 }}>
                    {activeNews.content}
                </p>
            </div>
            <div style={{ marginTop: 16 }}>
                <Link to="/user/private/news" style={{
                    color: "var(--admin-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
                }}>← Volver a noticias</Link>
            </div>
        </div>
    );
}

export default UserNewsDetail;
