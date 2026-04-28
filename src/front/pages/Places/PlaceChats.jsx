import React from "react";
import ChatPanelMDB from "../../components/Chat/ChatPanelMDB";
import { Link } from "react-router-dom";

const PlaceChats = () => {
    return (
        <div className="text-center mx-auto">
            <ChatPanelMDB type="place" />
            <div className="text-center my-4">
                <Link to="/places/private" className="btn btn-secondary">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default PlaceChats;
