import React, { useState } from "react";

const MessageReplyForm = ({ recipient, type, onMessageSent, onCancel }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const token = type === "user" 
                ? (localStorage.getItem("userToken") || localStorage.getItem("tokenUser")) 
                : localStorage.getItem("token_place");
            
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: type === "user" ? recipient.user_id : recipient.user_id, // This needs to be correct
                    place_id: recipient.place_id,
                    message: message,
                    sender: type
                })
            });

            if (response.ok) {
                setMessage("");
                onMessageSent();
            } else {
                console.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card mt-4 shadow border-primary">
            <div className="card-header bg-primary text-white">
                Reply to {type === "user" ? recipient.place_name : recipient.user_name}
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !message.trim()}>
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessageReplyForm;
