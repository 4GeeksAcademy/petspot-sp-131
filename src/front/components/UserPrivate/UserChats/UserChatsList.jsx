import { useState, useEffect } from "react";

function UserChatsList() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState(null);

    const fetchMessages = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("userToken");
            const response = await fetch(`${backendUrl}/api/chat/user`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleReply = (msg) => {
        setReplyTo(msg);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMessageSent = () => {
        setReplyTo(null);
        fetchMessages();
    };

    if (loading) return (
        <p style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "20px 0" }}>Cargando mensajes…</p>
    );

    return (
        <div style={{ maxWidth: 700 }}>
            <div className="d-flex flex-column gap-3">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} style={{
                            background: "var(--admin-surface)",
                            border: "1px solid var(--admin-border)",
                            borderRadius: "var(--admin-radius)",
                            boxShadow: "var(--admin-shadow-sm)",
                            padding: "14px 18px",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontWeight: 700, color: "var(--admin-primary)", fontSize: "0.9rem" }}>
                                    {msg.place_name}
                                </span>
                                <small style={{ color: "var(--admin-text-muted)", fontSize: "0.78rem" }}>
                                    {new Date(msg.created_at).toLocaleString()}
                                </small>
                            </div>
                            <p style={{ marginBottom: 0, color: "var(--admin-text)", fontSize: "0.875rem" }}>{msg.message}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>No hay mensajes todavía.</p>
                )}
            </div>
        </div>
    );
}

export default UserChatsList;
