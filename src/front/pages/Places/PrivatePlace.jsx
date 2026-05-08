import PlacePrivateCard from "../../components/Places/PlacePrivateCard";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PrivatePlace() {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        async function fetchDashboardData() {
            const tokenPlace = localStorage.getItem("token_place");
            if (!tokenPlace) return;

            try {
                // Fetch reservations
                const resResponse = await fetch(`${backendUrl}/api/places/private/reservations`, {
                    headers: { "Authorization": `Bearer ${tokenPlace}` }
                });
                if (resResponse.ok) {
                    const resData = await resResponse.json();
                    setReservations(resData);
                }

                // Fetch reviews
                const revResponse = await fetch(`${backendUrl}/api/places/private/reviews`, {
                    headers: { "Authorization": `Bearer ${tokenPlace}` }
                });
                if (revResponse.ok) {
                    const revData = await revResponse.json();
                    setReviews(revData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        }

        fetchDashboardData();
    }, []);

    function handleLogOutClick() {
        localStorage.removeItem("token_place");
        navigate("/places/login");
    }

    async function handleDeleteProfile() {
        if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) return;

        const tokenPlace = localStorage.getItem("token_place");
        try {
            const response = await fetch(`${backendUrl}/api/places/private`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${tokenPlace}` }
            });
            if (response.ok) {
                alert("Profile deleted successfully.");
                handleLogOutClick();
            } else {
                alert("Failed to delete profile.");
            }
        } catch (error) {
            alert("Error deleting profile.");
        }
    }

    const placeName = localStorage.getItem("place_name") || "Mi local";

    return (
        <div>
            <div className="pvt-welcome">
                <div>
                    <h2 className="pvt-welcome__title">¡Bienvenido, {placeName}! 🐾</h2>
                    <p className="pvt-welcome__sub">Gestiona tus reservas, mesas y chats desde aquí.</p>
                </div>
                <div className="pvt-welcome__icon">
                    <i className="fa-solid fa-store" aria-hidden="true" />
                </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-4">
                <Link to="/places/private/edit" className="btn btn-sm" style={{ background: "var(--admin-warning)", color: "#fff", border: "none" }}>
                    <i className="fa-solid fa-pen me-1" />Editar perfil
                </Link>
                <Link to="/places/private/dashboard" className="btn btn-sm" style={{ background: "var(--admin-primary)", color: "#fff", border: "none" }}>
                    <i className="fa-solid fa-table-cells me-1" />Reservas y mesas
                </Link>
                <Link to="/places/private/chats" className="btn btn-sm" style={{ background: "var(--admin-accent)", color: "#fff", border: "none" }}>
                    <i className="fa-solid fa-comments me-1" />Chats
                </Link>
                <button onClick={handleDeleteProfile} className="btn btn-sm btn-danger">
                    <i className="fa-solid fa-trash me-1" />Eliminar perfil
                </button>
            </div>
            
            <div className="row">
                <div className="col-12 mb-5">
                    <h3 className="mb-3 border-bottom pb-2">Profile Information</h3>
                    <PlacePrivateCard />
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-5">
                    <h3 className="mb-3 border-bottom pb-2">My Reservations</h3>
                    {reservations.length === 0 ? (
                        <p className="text-muted">No reservations found.</p>
                    ) : (
                        <ul className="list-group">
                            {reservations.map(res => (
                                <li key={res.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{res.reservation_date} {res.reservation_time}</strong>
                                        <br />
                                        User: {res.user_name} | People: {res.people_count}
                                    </div>
                                    <span className={`badge ${res.status === 'confirmed' ? 'bg-success' : res.status === 'pending' ? 'bg-warning' : 'bg-secondary'}`}>
                                        {res.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="col-md-6 mb-5">
                    <h3 className="mb-3 border-bottom pb-2">My Reviews</h3>
                    {reviews.length === 0 ? (
                        <p className="text-muted">No reviews found.</p>
                    ) : (
                        <div className="list-group">
                            {reviews.map(rev => (
                                <div key={rev.id} className="list-group-item list-group-item-action flex-column align-items-start">
                                    <div className="d-flex w-100 justify-content-between">
                                        <h5 className="mb-1">{rev.title}</h5>
                                        <small>Rating: {rev.rating}/5</small>
                                    </div>
                                    <p className="mb-1">{rev.content}</p>
                                    <small className="text-muted">From User ID: {rev.user_id} - {rev.created_at}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PrivatePlace;
