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

    if (loading) return <div className="text-center p-5">Loading your messages...</div>;

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 700 }}>
             <div className="d-flex flex-column gap-3">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-3 rounded shadow-sm border">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold text-primary">From: {msg.place_name}</span>
                                <small className="text-muted">{new Date(msg.created_at).toLocaleString()}</small>
                            </div>
                            <p className="mb-2">{msg.message}</p>
                        </div>
                    ))
                ) : (
                    <p className="mb-0">No messages yet.</p>
                )}
            </div>
        </div>
    );
}

export default UserChatsList;
