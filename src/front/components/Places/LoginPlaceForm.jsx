import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="placeLoginEmail" className="form-label">Email *</label>
                    <input
                        onChange={(event) => setEmail(event.target.value)}
                        value={email}
                        type="email"
                        className="form-control"
                        id="placeLoginEmail"
                        name="email"
                        required
                        placeholder="youremail@email.com"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="placeLoginPassword" className="form-label">Password *</label>
                    <input
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}
                        type="password"
                        className="form-control"
                        id="placeLoginPassword"
                        name="password"
                        required
                    />
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>
            </form >
        </>
    )
}

export default LoginPlaceForm;
