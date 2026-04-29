import React from "react";

const MessageInbox = ({ messages, type, onReply }) => {
    if (!messages || messages.length === 0) {
        return (
            <div className="alert alert-info text-center">
                No messages yet.
            </div>
        );
    }

    return (
        <div className="message-inbox">
            {messages.map((msg) => {
                const isSentByMe = msg.sender === type;
                const otherPartyName = type === "user" ? msg.place_name : msg.user_name;
                const date = new Date(msg.created_at).toLocaleString();

                return (
                    <div key={msg.id} className={`card mb-3 shadow-sm ${isSentByMe ? 'border-primary' : 'border-secondary'}`}>
                        <div className="card-header d-flex justify-content-between align-items-center bg-light">
                            <span>
                                <strong>{isSentByMe ? "To: " : "From: "}</strong>
                                {otherPartyName}
                            </span>
                            <small className="text-muted">{date}</small>
                        </div>
                        <div className="card-body">
                            <p className="card-text">{msg.message}</p>
                            {!isSentByMe && (
                                <button 
                                    className="btn btn-sm btn-outline-primary float-end"
                                    onClick={() => onReply(msg)}
                                >
                                    Reply
                                </button>
                            )}
                            {isSentByMe && (
                                <span className="badge bg-primary float-end">Sent</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageInbox;
