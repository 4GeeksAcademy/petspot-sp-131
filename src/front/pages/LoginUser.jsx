import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const LoginUser = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const userToken = store.userToken || localStorage.getItem("tokenUser");

        if (userToken) {
            if (store.userToken !== userToken) {
                dispatch({
                    type: "SET_USER_TOKEN",
                    payload: userToken
                });
            }

            navigate("/private/user", { replace: true });
        }
    }, [dispatch, navigate, store.userToken]);

    function sendData(e) {
        e.preventDefault();

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/login/user", requestOptions)
            .then(response => {
                return response.json().then(data => ({
                    status: response.status,
                    data: data
                }));
            })
            .then(({ status, data }) => {
                if (status === 200 && data.access_token) {
                    dispatch({ type: "SET_USER_TOKEN", payload: data.access_token });
                    localStorage.setItem("tokenUser", data.access_token);
                    window.dispatchEvent(new Event("tokenTest"))
                    setError("");
                    navigate("/private/user", { replace: true });
                } else {
                    setError(data.msg || "Email o contraseña incorrectos");
                }
            })
            .catch(() => {
                setError("Ha ocurrido un error al iniciar sesión");
            });
    }

    return (
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">User Log In</h1>
            <div className="text-center my-5">
                <Link to="/" className="btn btn-secondary">Go Back Home</Link>
            </div>

            <form
                onSubmit={sendData}
                noValidate
                className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
                style={{ maxWidth: 600 }}
            >
                <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label">Email *</label>
                    <input
                        id="loginEmail"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                        }}
                        type="email"
                        className={`form-control ${error ? "is-invalid" : ""}`}
                        placeholder="youremail@email.com"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">Password *</label>
                    <input
                        id="loginPassword"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError("");
                        }}
                        type="password"
                        className={`form-control ${error ? "is-invalid" : ""}`}
                    />
                </div>

                <p className="text-body-secondary small mb-4">* Required fields</p>

                {error && (
                    <div className="invalid-feedback d-block text-start mb-3">
                        {error}
                    </div>
                )}

                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">
                        Submit
                    </button>
                </div>

                <p className="text-center mt-4 mb-0">
                    ¿Aún no tienes cuenta? <Link to="/signup/user">Regístrate aquí</Link>
                </p>
            </form>
        </div>
    );
};
