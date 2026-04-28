import ChatPanel from "../../Chat/ChatPanel";

function UserChatsList() {
    return (
        <div className="container-fluid p-0 bg-white">
            <ChatPanel type="user" />
        </div>
    );
}

export default UserChatsList;
