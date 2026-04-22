import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchReview = async () => {
            try {
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

    const renderStars = (rating) => {
        const fullStars = Number(rating) || 0;
        return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <p>Cargando review...</p>
            </div>
        );
    }

    if (message) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">{message}</div>
                <Link to="/reviews" className="btn btn-secondary">
                    Volver al listado
                </Link>
            </div>
        );
    }
    if (!review) return null;

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Detalle de Review</h1>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-12 col-md-4">
                            <h5 className="mb-2">User #{review.user_id}</h5>
                            <p className="text-muted mb-3">{review.created_at}</p>

                            <p className="mb-0">
                                <span className="text-warning fs-4">
                                    {renderStars(review.rating)}
                                </span>
                                <span className="ms-2 fw-bold">{review.rating}</span>
                            </p>
                        </div>

                        <div className="col-12 col-md-8">
                            <h4 className="mb-3">{review.title}</h4>

                            <p className="mb-4">{review.content}</p>

                            <p className="mb-2">
                                <strong>Reservation ID:</strong> {review.reservation_id}
                            </p>

                            <p className="mb-4">
                                <strong>Active:</strong> {review.is_active ? "Sí" : "No"}
                            </p>

                            <Link to="/reviews" className="btn btn-secondary me-2">
                                Volver
                            </Link>

                            <Link to={`/reviews/edit/${review.id}`} className="btn btn-primary">
                                Editar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};