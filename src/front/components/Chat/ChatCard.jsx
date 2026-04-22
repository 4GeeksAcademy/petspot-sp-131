import React from "react";
import { Link } from "react-router-dom";

const ChatCard = ({ chat, onDelete }) => {
    return (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                <h5 className="card-title">Chat #{chat.id}</h5>
                <p className="card-text">
                    <strong>Usuario:</strong> {chat.user_name || "Desconocido"}
                </p>
                <p className="card-text">
                    <strong>Lugar:</strong> {chat.place_name || "Desconocido"}
                </p>
                <p className="card-text">
                    <strong>Sender:</strong> {chat.sender}
                </p>
                <p className="card-text">
                    <strong>Mensaje:</strong> {chat.message}
                </p>

                <Link
                    to={`/chat/edit/${chat.id}`}
                    className="btn btn-warning btn-sm mt-2 me-2"
                >
                    Editar
                </Link>

                <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => onDelete(chat.id)}
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default ChatCard;