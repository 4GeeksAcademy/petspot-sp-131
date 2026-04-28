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
                dispatch({
                    type: "SET_USER_TOKEN",
                    payload: userToken
                });
            }

            navigate("/user/private", { replace: true });
        }
        else {
            dispatch({type: "USER_LOGOUT"})
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

        const body = {
            email: trimmedEmail,
            password: trimmedPassword
        };

        try {
            const response = await fetch(`${backendUrl}/api/user/login`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json"
                }
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
        <div className="text-center mx-auto">
            <h1 className="text-center my-5 display-3">User Log In</h1>
            <div className="text-center my-5">
                <Link to="/" className="btn btn-secondary">Go Back Home</Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start"
                style={{ maxWidth: 600 }}
            >
                <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label">Email *</label>
                    <input
                        onChange={(event) => setEmail(event.target.value)}
                        value={email}
                        type="email"
                        className="form-control"
                        id="loginEmail"
                        name="email"
                        required
                        placeholder="youremail@email.com"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="loginPassword" className="form-label">Password *</label>
                    <input
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}
                        type="password"
                        className="form-control"
                        id="loginPassword"
                        name="password"
                        required
                    />
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>

                <p className="text-center mt-4 mb-0">
                    Don't have an account yet? <Link to="/signup/user">Sign up here</Link>
                </p>
            </form>
        </div>
    );
}

export default UserLogin;
