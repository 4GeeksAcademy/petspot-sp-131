import ChatPanelMDB from "../../../components/Chat/ChatPanelMDB";
import { Link } from "react-router-dom";

function UserChats() {
    return (
        <div className="text-center mx-auto" style={{ minHeight: "100vh" }}>
            <div className="py-4">
                <Link to="/user/private" className="btn btn-secondary mb-3">
                    Go Back to Dashboard
                </Link>
            </div>
            <ChatPanelMDB type="user" />
        </div>
    );
}

export default UserChats;
