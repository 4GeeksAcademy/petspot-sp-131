import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function AddNewsForm() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [postDate, setPostDate] = useState("")
    const [postType, setPostType] = useState("news")
    const [admins, setAdmins] = useState([])
    const [adminId, setAdminId] = useState("")

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/admin`, {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("tokenAdmin")}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAdmins(data);
                    if (data.length > 0) {
                        setAdminId(data[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching admins:", error);
            }
        };
        fetchAdmins();
    }, []);

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedTitle = title.trim()
        const trimmedContent = content.trim()

        if (!trimmedTitle || !trimmedContent || !postDate || !adminId) {
            alert("Please fill all required fields.")
            return
        }

        const body = {
            id_admin: adminId,
            title: trimmedTitle,
            content: trimmedContent,
            post_date: postDate,
            post_type: postType
        }

        async function addNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news`, {
                    method: "POST",
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

                const newNews = await response.json()
                dispatch({
                    type: "ADD_NEWS",
                    payload: newNews
                })
                navigate("/news")
            } catch (error) {
                alert("Unable to add the news right now. Please try again.")
            }
        }

        addNews()
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="adminId" className="form-label">Admin *</label>
                <select
                    onChange={(event) => setAdminId(event.target.value)}
                    value={adminId}
                    className="form-control"
                    id="adminId"
                    name="admin_id"
                    required
                >
                    <option value="" disabled>Select an admin</option>
                    {admins.map(admin => (
                        <option key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                        </option>
                    ))}
                </select>
            </div>
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

export default AddNewsForm;