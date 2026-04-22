import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

function NewsDetailCard() {

    const { store } = useGlobalReducer();
    const { id } = useParams();
    const activeNews = store.news.find((news) => news.id === Number(id))

    if (!activeNews) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>News not found</p>
    }

    return (
        <>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <span className="fw-bold">Title: </span>{activeNews.title}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Content: </span>
                    <div className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{activeNews.content}</div>
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Type: </span>{activeNews.post_type}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Date: </span>{activeNews.post_date}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Posted by: </span>{activeNews.admin_name}
                </div>
            </div>
        </>
    )
}

export default NewsDetailCard;