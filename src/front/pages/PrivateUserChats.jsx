import React from "react";
import { Link } from "react-router-dom";
import MessageInbox from "../../components/Chat/MessageInbox";

const PrivateUserChats = () => {
    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Mis Mensajes</h1>
                <Link to="/private/user" className="btn btn-secondary">
                    Volver al Panel
                </Link>
            </div>
            <div className="card shadow-sm p-4">
                <MessageInbox type="user" />
            </div>
        </div>
    );
};

export default PrivateUserChats;
