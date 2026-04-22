import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddChatForm = () => {
    const [formData, setFormData] = useState({
        user_id: "",
        place_id: "",
        message: "",
        sender: ""
    });

    const [users, setUsers] = useState([]);
    const [places, setPlaces] = useState([]);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;

                const [usersRes, placesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/users`),
                    fetch(`${backendUrl}/api/places`)
                ]);

                const usersData = await usersRes.json();
                const placesData = await placesRes.json();

                if (usersRes.ok) setUsers(usersData);
                if (placesRes.ok) setPlaces(placesData);
            } catch (error) {
                setMessage("Error al cargar usuarios o places");
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: Number(formData.user_id),
                    place_id: Number(formData.place_id),
                    message: formData.message,
                    sender: formData.sender
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.msg || "Error al crear chat");
                return;
            }

            navigate("/chat");
        } catch (error) {
            setMessage("Error al conectar con el servidor");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Usuario</label>
                <select
                    className="form-select"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona un usuario</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.name} (ID: {user.id})
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Place</label>
                <select
                    className="form-select"
                    name="place_id"
                    value={formData.place_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona un place</option>
                    {places.map((place) => (
                        <option key={place.id} value={place.id}>
                            {place.name} (ID: {place.id})
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Mensaje</label>
                <textarea
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Sender</label>
                <select
                    className="form-select"
                    name="sender"
                    value={formData.sender}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona quién envía</option>
                    <option value="user">user</option>
                    <option value="place">place</option>
                </select>
            </div>

            <button
                type="submit"
                className="btn btn-success me-2"
                disabled={submitting}
            >
                {submitting ? "Creando..." : "Crear Chat"}
            </button>

            <Link to="/chat" className="btn btn-secondary">
                Volver
            </Link>

            {message && (
                <div className="alert alert-info mt-3">
                    {message}
                </div>
            )}
        </form>
    );
};

export default AddChatForm;