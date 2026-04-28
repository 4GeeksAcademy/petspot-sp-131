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
                        to={localStorage.getItem("tokenUser") ? "/private/user" : "/user/private"}
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
                    <button className="btn btn-danger ms-2" onClick={handleLogout}>Log Out</button>
                </li>
            </ul>
        </>
    )
}

export default UserNavbar;
