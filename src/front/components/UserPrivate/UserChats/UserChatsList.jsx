import React, { useEffect, useState } from "react";
import MessageInbox from "../../Chat/MessageInbox";
import MessageReplyForm from "../../Chat/MessageReplyForm";

function UserChatsList() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyTo, setReplyTo] = useState(null);

    const fetchMessages = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = localStorage.getItem("userToken") || localStorage.getItem("tokenUser");
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
        <div className="mx-auto p-4" style={{ maxWidth: 800 }}>
            {replyTo && (
                <div className="mb-4">
                    <MessageReplyForm 
                        recipient={replyTo} 
                        type="user" 
                        onMessageSent={handleMessageSent} 
                        onCancel={() => setReplyTo(null)}
                    />
                </div>
            )}
            <MessageInbox 
                messages={messages} 
                type="user" 
                onReply={handleReply} 
            />
        </div>
    );
}

export default UserChatsList;
