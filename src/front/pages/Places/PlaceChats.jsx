import React from "react";
import ChatPanelMDB from "../../components/Chat/ChatPanelMDB";

const PlaceChats = () => {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 16 }}>
                <i className="fa-solid fa-comments me-2" style={{ color: "var(--admin-primary)" }} />
                Chats
            </h5>
            <div className="pvt-chat-container">
                <ChatPanelMDB type="place" />
            </div>
        </div>
    );
};

export default PlaceChats;
