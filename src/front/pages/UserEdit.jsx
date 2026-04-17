import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

export const UserEdit = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const [user, setUser] = useState({
		name: "",
		email: "",
		password: ""
	});

	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const backendUrl = import.meta.env.VITE_BACKEND_URL;

	// 🔹 Cargar usuario
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(`${backendUrl}/api/users/${id}`);
				const data = await response.json();

				if (response.ok) {
					setUser(data);
				} else {
					setMessage("Error al cargar usuario");
				}
			} catch (error) {
				setMessage("Error al conectar con el servidor");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [id]);

	// 🔹 Manejar inputs
	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	// 🔹 Enviar actualización
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const dataToSend = { ...user };

			// Si no escribe password, no lo mandamos
			if (!dataToSend.password) {
				delete dataToSend.password;
			}

			const response = await fetch(`${backendUrl}/api/users/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataToSend)
			});

			if (response.ok) {
				setMessage("Usuario actualizado correctamente");
			} else {
				const errorData = await response.json();
				setMessage(errorData.msg || "Error al actualizar usuario");
			}
		} catch (error) {
			setMessage("Error al conectar con el servidor");
		} finally {
			setSubmitting(false);
		}
	};

	// 🔹 Loading
	if (loading) {
		return (
			<div className="text-center mt-5">
				<p>Cargando...</p>
			</div>
		);
	}

	return (
		<div className="container mt-5">
			<h1 className="mb-4">Editar Usuario</h1>

			{message && (
				<div className={`alert ${message.includes("correctamente") ? "alert-success" : "alert-danger"}`}>
					{message}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label className="form-label">Nombre</label>
					<input
						type="text"
						className="form-control"
						name="name"
						value={user.name}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Email</label>
					<input
						type="email"
						className="form-control"
						name="email"
						value={user.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">
						Password (dejar vacío para no cambiar)
					</label>
					<input
						type="password"
						className="form-control"
						name="password"
						value={user.password}
						onChange={handleChange}
						placeholder="Nueva contraseña"
					/>
				</div>

				<button
					type="submit"
					className="btn btn-primary"
					disabled={submitting}
				>
					{submitting ? "Guardando..." : "Guardar Cambios"}
				</button>

				<Link to="/user" className="btn btn-secondary ms-2">
					Volver al listado
				</Link>
			</form>
		</div>
	);
};