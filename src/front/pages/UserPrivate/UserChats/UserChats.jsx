import UserChatsList from "../../../components/UserPrivate/UserChats/UserChatsList";

function UserChats() {
    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">My Chats</h1>
            <UserChatsList />
        </div>
    );
}

export default UserChats;
