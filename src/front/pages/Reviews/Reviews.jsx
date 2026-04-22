import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/reviews`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data);
      } else {
        setMessage("Error al cargar reviews");
      }
    } catch (error) {
      setMessage("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/api/reviews/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Review eliminada correctamente");
        fetchReviews();

        setTimeout(() => {
          setMessage("");
        }, 2000);
      } else {
        setMessage(data.msg || "Error al eliminar review");
      }
    } catch (error) {
      setMessage("Error al conectar con el servidor");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <p>Cargando reviews...</p>
      </div>
    );
  }

  const renderStars = (rating) => {
    const fullStars = Number(rating) || 0;
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Reviews</h1>

      {message && <div className="alert alert-danger">{message}</div>}

      <Link to="/reviews/create" className="btn btn-success mb-3">
        + Crear Review
      </Link>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Reservation</th>
            <th>Rating</th>
            <th>Título</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {reviews.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No hay reviews registradas
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.user_id}</td>
                <td>{review.reservation_id}</td>
                <td>
                  <span className="text-warning">
                    {renderStars(review.rating)}
                  </span>
                  <span className="ms-2">{review.rating}</span>
                </td>
                <td>{review.title}</td>

                <td>
                  <Link
                    to={`/reviews/detail/${review.id}`}
                    className="btn btn-info btn-sm me-2"
                  >
                    Ver
                  </Link>

                  <Link
                    to={`/reviews/edit/${review.id}`}
                    className="btn btn-primary btn-sm me-2"
                  >
                    Editar
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};