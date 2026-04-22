import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function EditNewsForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [postDate, setPostDate] = useState("")
    const [postType, setPostType] = useState("news")

    const activeNews = store.news.find((news) => news.id === Number(id))

    useEffect(() => {
        if (activeNews) {
            setTitle(activeNews.title)
            setContent(activeNews.content)
            setPostDate(activeNews.post_date)
            setPostType(activeNews.post_type)
        }
    }, [activeNews])

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedTitle = title.trim()
        const trimmedContent = content.trim()

        if (!trimmedTitle || !trimmedContent || !postDate) {
            alert("Please fill all required fields.")
            return
        }

        const body = {
            title: trimmedTitle,
            content: trimmedContent,
            post_date: postDate,
            post_type: postType
        }

        async function updateNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    const backendMessage = errorData.msg || errorData.message || "Unknown backend error"
                    alert(`Error ${response.status}: ${backendMessage}`)
                    return
                }

                const updatedNews = await response.json()
                dispatch({
                    type: "UPDATE_NEWS",
                    payload: updatedNews
                })
                navigate("/news")
            } catch (error) {
                alert("Unable to update the news right now. Please try again.")
            }
        }

        updateNews()
    }

    if (!activeNews && store.news.length > 0) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>News not found</p>
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Title *</label>
                <input
                    onChange={(event) => setTitle(event.target.value)}
                    value={title}
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    maxLength="255"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="content" className="form-label">Content *</label>
                <textarea
                    onChange={(event) => setContent(event.target.value)}
                    value={content}
                    className="form-control"
                    id="content"
                    name="content"
                    rows="5"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="postDate" className="form-label">Post Date *</label>
                <input
                    onChange={(event) => setPostDate(event.target.value)}
                    value={postDate}
                    type="date"
                    className="form-control"
                    id="postDate"
                    name="post_date"
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="postType" className="form-label">Post Type *</label>
                <select
                    onChange={(event) => setPostType(event.target.value)}
                    value={postType}
                    className="form-control"
                    id="postType"
                    name="post_type"
                    required
                >
                    <option value="news">News</option>
                    <option value="normative">Normative</option>
                    <option value="event">Event</option>
                </select>
            </div>
            <p className="text-body-secondary small mb-4">* Required field</p>
            <div className="mt-5">
                <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
            </div>
        </form>
    );
}

export default EditNewsForm;