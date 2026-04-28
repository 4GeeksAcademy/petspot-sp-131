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
        <div className="border-bottom py-3 mb-4 bg-white shadow-sm">
            <ul className="nav justify-content-center">
                <li className="nav-item">
                    <NavLink
                        end
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private"
                    >
                        Home
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private/profile"
                    >
                        Profile
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private/favorites"
                    >
                        Favorites
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private/pets"
                    >
                        Pets
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private/reservations"
                    >
                        Reservations
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
                        to="/user/private/reviews"
                    >
                        Reviews
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link px-3 py-2 ${isActive ? "text-primary fw-bold border-bottom border-primary border-3" : "text-secondary"}`}
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
                    <button className="btn btn-danger ms-2" onClick={handleLogout}>Log Out</button>
                </li>
            </ul>
        </div>
    )
}

export default UserNavbar;
