import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
            <ul className="nav nav-pills">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/private/user">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/private/user/profile">Profile</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/private/user/favorites">Favorites</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/private/user/reservations">Reservations</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/private/user/chats">Chats</Link>
                </li>
                <li className="nav-item">
                    <button className="btn btn-warning" onClick={handleLogout}>Log Out</button>
                </li>
            </ul>
        </>
    )
}

export default UserNavbar;
