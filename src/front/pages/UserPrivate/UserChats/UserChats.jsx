import ChatPanelMDB from "../../../components/Chat/ChatPanelMDB";
import { Link } from "react-router-dom";

function UserChats() {
    return (
        <div className="text-center mx-auto">
            <ChatPanelMDB type="user" />
            <div className="text-center my-4">
                <Link to="/user/private" className="btn btn-secondary">
                    Volver al Panel
                </Link>
            </div>
        </div>
    );
}

export default UserChats;
