import React, { useEffect, useState, useMemo } from "react";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedConv, setExpandedConv] = useState(null);

    const fetchChats = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/chat`);
            const data = await response.json();
            if (!response.ok) {
                setError(data.msg || "Error al cargar chats");
                return;
            }
            setChats(data);
        } catch (err) {
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const conversations = useMemo(() => {
        const groups = {};
        chats.forEach(chat => {
            const key = `${chat.user_id}-${chat.place_id}`;
            if (!groups[key]) {
                groups[key] = {
                    user_name: chat.user_name,
                    place_name: chat.place_name,
                    messages: []
                };
            }
            groups[key].messages.push(chat);
        });
        // Sort messages in each group by date
        Object.values(groups).forEach(group => {
            group.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });
        return groups;
    }, [chats]);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este mensaje?")) return;
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            await fetch(`${backendUrl}/api/chat/${id}`, { method: "DELETE" });
            setChats(prev => prev.filter(chat => chat.id !== id));
        } catch (error) {
            console.error("Error eliminando chat:", error);
        }
    };

    if (loading) return <p className="text-center mt-5">Cargando comunidad...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container pb-5">
            <h2 className="mb-4">Conversaciones de la Comunidad</h2>
            <div className="accordion shadow-sm rounded overflow-hidden">
                {Object.keys(conversations).length === 0 ? (
                    <div className="p-4 text-center bg-white text-muted">No hay mensajes en la comunidad.</div>
                ) : (
                    Object.entries(conversations).map(([key, group], index) => (
                        <div className="accordion-item border-bottom" key={key}>
                            <h2 className="accordion-header">
                                <button 
                                    className={`accordion-button ${expandedConv === key ? "" : "collapsed"} bg-light`} 
                                    type="button" 
                                    onClick={() => setExpandedConv(expandedConv === key ? null : key)}
                                >
                                    <div className="d-flex justify-content-between w-100 pe-3 align-items-center">
                                        <span>
                                            <i className="fa-solid fa-user me-2 text-primary"></i>
                                            <strong>{group.user_name}</strong>
                                            <i className="fa-solid fa-arrow-right-arrow-left mx-3 text-muted small"></i>
                                            <i className="fa-solid fa-store me-2 text-success"></i>
                                            <strong>{group.place_name}</strong>
                                        </span>
                                        <span className="badge bg-secondary rounded-pill">{group.messages.length} msgs</span>
                                    </div>
                                </button>
                            </h2>
                            <div className={`accordion-collapse collapse ${expandedConv === key ? "show" : ""}`}>
                                <div className="accordion-body bg-white p-0">
                                    <div className="list-group list-group-flush">
                                        {group.messages.map((msg) => (
                                            <div key={msg.id} className="list-group-item p-3 border-0 border-bottom">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <span className={`badge ${msg.sender === 'user' ? 'bg-primary' : 'bg-success'} mb-2`}>
                                                            {msg.sender === 'user' ? 'Usuario' : 'Local'}
                                                        </span>
                                                        <p className="mb-1">{msg.message}</p>
                                                        <small className="text-muted">
                                                            {new Date(msg.created_at).toLocaleString()}
                                                        </small>
                                                    </div>
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleDelete(msg.id)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;