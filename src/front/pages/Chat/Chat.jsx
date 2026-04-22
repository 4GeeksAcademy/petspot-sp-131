import React from "react";
import { Link } from "react-router-dom";
import ChatList from "../../components/Chat/ChatList";

const Chat = () => {
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Chats</h1>
                <Link to="/chat/add" className="btn btn-primary">
                    Crear Chat
                </Link>
            </div>

            <ChatList />
        </div>
    );
};

export default Chat;