import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function DeleteNewsConfirmation() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const activeNews = store.news.find((news) => news.id === Number(id))

    async function handleDeleteNews() {
        try {
            const response = await fetch(`${backendUrl}/api/news/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                const errorData = await response.json()
                const backendMessage = errorData.msg || errorData.message || "Unknown backend error"
                alert(`Error ${response.status}: ${backendMessage}`)
                return
            }

            dispatch({
                type: "DELETE_NEWS",
                payload: Number(id)
            })
            navigate("/news")
        } catch (error) {
            alert("Unable to delete the news right now. Please try again.")
        }
    }

    if (!activeNews && store.news.length > 0) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>News not found</p>
    }

    return (
        <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <p className="text-danger fw-semibold text-center mb-4">
                Are you sure you want to delete this news?
            </p>
            <div className="mb-4">
                <span className="fw-bold">Title: </span>{activeNews?.title}
            </div>
            <div className="mb-4">
                <span className="fw-bold">Type: </span>{activeNews?.post_type}
            </div>
            <div className="mb-4">
                <span className="fw-bold">Date: </span>{activeNews?.post_date}
            </div>
            <button type="button" className="btn btn-danger d-block mx-auto" onClick={handleDeleteNews}>
                Confirm delete
            </button>
        </div>
    );
}

export default DeleteNewsConfirmation;