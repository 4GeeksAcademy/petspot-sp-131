import { NavLink, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


function UserNavbar() {

    const navigate = useNavigate()

    const { dispatch } = useGlobalReducer()

    function handleLogout() {
        localStorage.removeItem("userToken")
        dispatch({
            type: "USER_LOGOUT"
        })
        navigate("/", { replace: true })
    }

    return (
        <>
            <ul className="nav nav-pills justify-content-center">
                <li className="nav-item">
                    <NavLink
                        end
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private"
                    >
                        Home
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/profile"
                    >
                        Profile
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/favorites"
                    >
                        Favorites
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/place-matcher"
                    >
                        Place-Matcher 🩷
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/pets"
                    >
                        Pets
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/reservations"
                    >
                        Reservations
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/reviews"
                    >
                        Reviews
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/news"
                    >
                        News
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/user/private/chats"
                    >
                        Chats
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/tell-me-more"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                            color: "white",
                            fontWeight: 600,
                            border: "none",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.35)",
                            transition: "all 0.2s",
                            marginLeft: "10px"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(124, 58, 237, 0.5)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(124, 58, 237, 0.35)";
                        }}
                    >
                        ✨ Tell me more
                    </NavLink>
                </li>
                <li className="nav-item">
                    <button className="btn btn-danger ms-2" onClick={handleLogout}>Log Out</button>
                </li>
            </ul>
        </>
    )
}

export default UserNavbar;
