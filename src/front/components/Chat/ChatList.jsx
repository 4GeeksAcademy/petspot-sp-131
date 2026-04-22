import React, { useEffect, useState } from "react";
import ChatCard from "./ChatCard";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleDelete = async (id) => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            await fetch(`${backendUrl}/api/chat/${id}`, {
                method: "DELETE"
            });

            setChats(chats.filter(chat => chat.id !== id));
        } catch (error) {
            console.error("Error eliminando chat:", error);
        }
    };

    const handleEdit = async (chat) => {
        const newMessage = prompt("Nuevo mensaje:", chat.message);

        if (!newMessage) return;

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/chat/${chat.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: chat.user_id,
                    place_id: chat.place_id,
                    message: newMessage,
                    sender: chat.sender
                })
            });

            const updatedChat = await response.json();

            if (!response.ok) {
                console.error(updatedChat.msg || "Error editando chat");
                return;
            }

            setChats(chats.map(c => c.id === chat.id ? updatedChat : c));
        } catch (error) {
            console.error("Error editando chat:", error);
        }
    };

    useEffect(() => {
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

        fetchChats();
    }, []);

    if (loading) return <p>Cargando chats...</p>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (chats.length === 0) return <div className="alert alert-info">No hay chats registrados.</div>;

    return (
        <div className="row">
            {chats.map((chat) => (
                <div className="col-md-6 col-lg-4 mb-4" key={chat.id}>
                    <ChatCard
                        chat={chat}
                        onDelete={handleDelete}
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatList;