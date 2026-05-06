import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import userHero from "../../assets/img/user.png";

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
        <>
            <Navbar />
            <div className="auth-page">
                <div className="auth-hero">
                    <h1 className="auth-hero-title">My Account</h1>

                    <div className="auth-breadcrumb">
                        <Link to="/">Home</Link>
                        <span>&gt;</span>
                        <span>Login</span>
                    </div>
                    <div className="auth-hero-image">
                        <img src={userHero} alt="User with dogs" />
                    </div>
                </div>

                <div className="auth-panel">
                    <form onSubmit={handleSubmit} className="auth-card">
                        <h2 className="auth-title">Welcome Back</h2>
                        <p className="auth-subtitle">Please login to your account</p>

                        <div className="auth-field">
                            <label htmlFor="userLoginEmail">Email Address</label>
                            <input
                                id="userLoginEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="userLoginPassword">Password</label>
                            <input
                                id="userLoginPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </div>

                        <div className="auth-options">
                            <label className="auth-check">
                                <input type="checkbox" />
                                <span>Remember Me</span>
                            </label>

                            <span className="auth-forgot">Forgot Password</span>
                        </div>

                        <div className="auth-actions">
                            <button type="submit" className="auth-btn">
                                Sign in
                            </button>

                            <Link to="/signup/user" className="auth-secondary-btn">
                                Register
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default UserLogin;
