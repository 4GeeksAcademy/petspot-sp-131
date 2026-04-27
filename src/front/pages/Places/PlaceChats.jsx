import React, { useEffect, useState } from "react";
import MessageInbox from "../../components/Chat/MessageInbox";
import MessageReplyForm from "../../components/Chat/MessageReplyForm";
import { Link } from "react-router-dom";

const PlaceChats = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState(null);

    const fetchMessages = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("token_place");
            const response = await fetch(`${backendUrl}/api/chat/place`, {
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
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="display-4">My Messages</h1>
                <Link to="/places/private" className="btn btn-outline-secondary mt-3">
                    Back to Dashboard
                </Link>
            </div>

            <div className="mx-auto" style={{ maxWidth: 800 }}>
                {replyTo && (
                    <div className="mb-4">
                        <MessageReplyForm 
                            recipient={replyTo} 
                            type="place" 
                            onMessageSent={handleMessageSent} 
                            onCancel={() => setReplyTo(null)}
                        />
                    </div>
                )}
                <MessageInbox 
                    messages={messages} 
                    type="place" 
                    onReply={handleReply} 
                />
            </div>
        </div>
    );
};

export default PlaceChats;
