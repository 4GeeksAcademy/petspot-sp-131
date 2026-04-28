import ChatPanelMDB from "../../Chat/ChatPanelMDB";

function UserChatsList() {
    return (
        <div className="container-fluid p-0">
            <ChatPanelMDB type="user" premium={true} />
        </div>
    );
}

export default UserChatsList;
