import UserChatsList from "../../../components/UserPrivate/UserChats/UserChatsList";
import { Link } from "react-router-dom";

function UserChats() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Chats</h1>
            <div className="text-center my-5">
                <Link to="/user/private" className="btn btn-secondary">
                    Go Back to Dashboard
                </Link>
            </div>
            <UserChatsList />
        </div>
    );
}

export default UserChats;
