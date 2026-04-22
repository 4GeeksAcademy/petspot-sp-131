import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ReviewCreate = () => {

    const [formData, setFormData] = useState({
        user_id: "",
        reservation_id: "",
        rating: "",
        title: "",
        content: "",
        created_at: ""
    });

    const [users, setUsers] = useState([]);
    const [reservations, setReservations] = useState([]);

    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const [hoverRating, setHoverRating] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;

                const [usersRes, reservationsRes] = await Promise.all([
                    fetch(`${backendUrl}/api/users`),
                    fetch(`${backendUrl}/api/reservations`)
                ]);

                const usersData = await usersRes.json();
                const reservationsData = await reservationsRes.json();

                console.log("usersData:", usersData);
                console.log("reservationsData:", reservationsData);

                if (usersRes.ok) setUsers(usersData);
                if (reservationsRes.ok) setReservations(reservationsData);

            } catch (error) {
                console.error("Error cargando usuarios o reservas", error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setTimeout(() => {
                    navigate("/reviews");
                }, 500);
            } else {
                setMessage(data.msg || "Error al crear review");
            }
        } catch (error) {
            setMessage("Error al conectar con el servidor");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Crear Review</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Usuario</label>
                    <select
                        className="form-control"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Selecciona un usuario</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Reserva</label>
                    <select
                        className="form-control"
                        name="reservation_id"
                        value={formData.reservation_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Selecciona una reserva</option>
                        {reservations.map((reservation) => (
                            <option key={reservation.id} value={reservation.id}>
                                Reserva #{reservation.id}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label d-block">Rating</label>

                    <div className="d-flex gap-2 fs-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                style={{ cursor: "pointer" }}
                                className={
                                    star <= (hoverRating || Number(formData.rating))
                                        ? "text-warning"
                                        : "text-muted"
                                }
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        rating: star
                                    })
                                }
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                {star <= (hoverRating || Number(formData.rating)) ? "★" : "☆"}
                            </span>
                        ))}
                    </div>

                    {formData.rating && (
                        <small className="text-muted">
                            {formData.rating} de 5
                        </small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contenido</label>
                    <textarea
                        className="form-control"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Created At</label>
                    <input
                        type="date"
                        className="form-control"
                        name="created_at"
                        value={formData.created_at}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                    {submitting ? "Creando..." : "Crear Review"}
                </button>

                <Link to="/reviews" className="btn btn-secondary ms-2">
                    Volver al listado
                </Link>
            </form>

            {message && <div className="alert alert-info mt-3">{message}</div>}


        </div>
    );
};