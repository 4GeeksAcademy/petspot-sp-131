import UserProfileCard from "../../../components/UserPrivate/UserProfile/UserProfileCard";

function UserProfile() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-user me-2" style={{ color: "var(--admin-primary)" }} />
                Mi perfil
            </h5>
            <UserProfileCard />
        </div>
    );
}

export default UserProfile;
