import UserNewsList from "../../../components/UserPrivate/UserNews/UserNewsList";

function UserNews() {
    return (
        <div>
            <h5 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 20 }}>
                <i className="fa-solid fa-newspaper me-2" style={{ color: "var(--admin-primary)" }} />
                Noticias
            </h5>
            <UserNewsList />
        </div>
    );
}

export default UserNews;
