import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserLogin() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const userToken = store.userToken || localStorage.getItem("userToken");

        if (userToken) {
            if (store.userToken !== userToken) {
                dispatch({ type: "SET_USER_TOKEN", payload: userToken });
            }
            navigate("/user/private", { replace: true });
        } else {
            dispatch({ type: "USER_LOGOUT" });
        }
    }, [dispatch, navigate, store.userToken]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            alert("Email and password are required.");
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/user/login`, {
                method: "POST",
                body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
                headers: { "Content-Type": "application/json" }
            });

            const responseJS = await response.json();

            if (!response.ok) {
                alert(responseJS.msg || responseJS.response || "Incorrect email or password.");
                return;
            }

            localStorage.setItem("userToken", responseJS.access_token);
            dispatch({ type: "SET_USER_TOKEN", payload: responseJS.access_token });
            navigate("/user/private", { replace: true });
        } catch (error) {
            alert("Unable to reach the server. Please try again.");
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--admin-bg)" }}>
            <div style={{
                width: "100%", maxWidth: 480,
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "var(--admin-radius)",
                boxShadow: "var(--admin-shadow-sm)",
                padding: "36px 40px",
            }}>
                <h4 style={{ fontWeight: 700, color: "var(--admin-text)", marginBottom: 4, textAlign: "center" }}>
                    <i className="fa-solid fa-paw me-2" style={{ color: "var(--admin-primary)" }} />
                    Iniciar sesión
                </h4>
                <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--admin-text-muted)", marginBottom: 28 }}>
                    Área privada de usuario
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="loginEmail" className="form-label" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Email *</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            className="form-control"
                            id="loginEmail"
                            name="email"
                            required
                            placeholder="tucorreo@email.com"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="loginPassword" className="form-label" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Contraseña *</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            className="form-control"
                            id="loginPassword"
                            name="password"
                            required
                        />
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginBottom: 20 }}>* Campos obligatorios</p>
                    <button type="submit" style={{
                        width: "100%", background: "var(--admin-primary)", color: "#fff", border: "none",
                        borderRadius: "var(--admin-radius-sm)", padding: "9px 0",
                        fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
                    }}>Entrar</button>
                    <p style={{ textAlign: "center", marginTop: 16, marginBottom: 0, fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                        ¿No tienes cuenta? <Link to="/signup/user" style={{ color: "var(--admin-primary)", fontWeight: 600 }}>Regístrate aquí</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default UserLogin;
