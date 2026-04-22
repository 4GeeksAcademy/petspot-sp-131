import React from "react";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const ReviewEdit = () => {
    const { id } = useParams();

    const [review, setReview] = React.useState({
        user_id: "",
        reservation_id: "",
        rating: "",
        title: "",
        content: "",
        created_at: ""
    });

    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [hoverRating, setHoverRating] = React.useState(0);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchReview = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;

                const response = await fetch(`${backendUrl}/api/reviews/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setReview(data);
                } else {
                    setMessage("No se pudo cargar la review");
                }
            } catch (error) {
                setMessage("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReview({
            ...review,
            [name]: value
        });
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <p>Cargando...</p>
            </div>
        );
    }

    if (message && !review.id) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{message}</div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/reviews/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(review)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Review actualizada correctamente");
                navigate("/reviews");
            } else {
                setMessage(data.msg || "Error al actualizar review");
            }
        } catch (error) {
            setMessage("Error al conectar con el servidor");
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Editar Review</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">User ID</label>
                    <input
                        type="number"
                        className="form-control"
                        name="user_id"
                        value={review.user_id}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Reservation ID</label>
                    <input
                        type="number"
                        className="form-control"
                        name="reservation_id"
                        value={review.reservation_id}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label d-block">Rating</label>

                    <div className="d-flex gap-2 fs-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                style={{ cursor: "pointer" }}
                                className={
                                    star <= (hoverRating || Number(review.rating))
                                        ? "text-warning"
                                        : "text-muted"
                                }
                                onClick={() =>
                                    setReview({
                                        ...review,
                                        rating: star
                                    })
                                }
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {star <= (hoverRating || Number(review.rating)) ? "★" : "☆"}
                            </span>
                        ))}
                    </div>

                    {review.rating && (
                        <small className="text-muted">
                            {review.rating} de 5
                        </small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={review.title}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contenido</label>
                    <textarea
                        className="form-control"
                        name="content"
                        value={review.content}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Created At</label>
                    <input
                        type="text"
                        className="form-control"
                        name="created_at"
                        value={review.created_at}
                        onChange={handleInputChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary">
                    Guardar cambios
                </button>

                <Link to="/reviews" className="btn btn-secondary ms-2">
                    Volver
                </Link>
            </form>

            {message && <div className="alert alert-info mt-3">{message}</div>}

        </div>
    );
};