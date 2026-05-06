import ChatPanelMDB from "../../../components/Chat/ChatPanelMDB";

function UserChats() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-comments me-2" style={{ color: "var(--admin-primary)" }} />
                Chats
            </h5>
            <div className="pvt-chat-container">
                <ChatPanelMDB type="user" />
            </div>
        </div>
    );
}

export default UserChats;
