import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function LoginPlaceForm() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail || !trimmedPassword) {
            alert("Email and password are required.");
            return;
        }

        const body = {
            email: trimmedEmail,
            password: trimmedPassword
        }

        async function loginRequest() {
            try {
                const response = await fetch(`${backendUrl}/api/places/login`, {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json"
                    }

                })

                const responseJS = await response.json();
                if (!response.ok) {
                    alert(responseJS.response);
                    return
                }

                localStorage.setItem("token_place", responseJS.access_token_place)
                navigate("/places/private")

            } catch (error) {
                alert("Unable to reach the server. Please try again.")
            }
        }
        loginRequest()
    }


    return (
        <form onSubmit={handleSubmit} className="auth-card">

            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Login to manage your place</p>

            <div className="auth-field">
                <label htmlFor="placeLoginEmail">Email Address</label>
                <input
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                    type="email"
                    id="placeLoginEmail"
                    name="email"
                    required
                    placeholder="Email Address"
                />
            </div>

            <div className="auth-field">
                <label htmlFor="placeLoginPassword">Password</label>
                <input
                    onChange={(event) => setPassword(event.target.value)}
                    value={password}
                    type="password"
                    id="placeLoginPassword"
                    name="password"
                    required
                    placeholder="Password"
                />
            </div>

            <div className="auth-actions">
                <button type="submit" className="auth-btn">
                    Sign in
                </button>

                <Link to="/places/signup" className="auth-secondary-btn">
                    Register
                </Link>
            </div>
        </form>
    );
}

export default LoginPlaceForm;
