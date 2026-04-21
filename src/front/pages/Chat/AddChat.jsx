import React from "react";
import AddChatForm from "../../components/Chat/AddChatForm";

const AddChat = () => {
    return (
        <div className="container mt-5">
            <h1 className="mb-4">Crear Chat</h1>
            <AddChatForm />
        </div>
    );
};

export default AddChat;