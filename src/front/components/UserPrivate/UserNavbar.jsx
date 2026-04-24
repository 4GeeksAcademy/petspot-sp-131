import { NavLink, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";


function UserNavbar() {

    const navigate = useNavigate()

    const { dispatch } = useGlobalReducer()

    function handleLogout() {
        localStorage.removeItem("tokenUser")
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
                        to="/private/user"
                    >
                        Home
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/private/user/profile"
                    >
                        Profile
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/private/user/favorites"
                    >
                        Favorites
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/private/user/reservations"
                    >
                        Reservations
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink
                        className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        to="/private/user/chats"
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
