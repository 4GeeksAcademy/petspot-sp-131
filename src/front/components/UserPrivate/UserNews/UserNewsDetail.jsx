
import { useParams } from "react-router-dom";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

function UserNewsDetail() {

    const { id } = useParams();
    const { store } = useGlobalReducer();

    const activeNews = store.news.find((news) => news.id === Number(id))

    if (!activeNews) {
        return (
            <div className="text-center mx-auto">
                <h1 className="text-center my-5 display-3">PetSpot News 📰</h1>
                <div className="text-center my-5">
                    <Link to="/user/private/news" replace className="btn btn-secondary">Go Back to News</Link>
                </div>
                <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>News not found</p>
            </div>
        )
    }

    return (
        <>
            <div className="text-center mx-auto mt-5">
                <h1 className="text-center h1 mb-3">{activeNews.title}</h1>
                <p className="opacity-50">🕑 {activeNews.post_date}</p>
                <div style={{ maxWidth: 800 }} className="mx-auto border-top pt-5 border-dark-subtle">
                    <p>{activeNews.content}</p>
                </div>
                <div className="text-center my-5">
                    <Link to="/user/private/news" className="btn btn-secondary">Go Back to News</Link>
                </div>
            </div>
        </>
    )
}

export default UserNewsDetail;