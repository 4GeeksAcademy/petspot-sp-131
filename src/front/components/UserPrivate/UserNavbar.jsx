import { Link } from "react-router-dom";


function UserNavbar() {
    return (
        <>
            <ul className="nav nav-pills">
                <li className="nav-item">
                    <Link className="nav-link active" aria-current="page" to="/user/dashboard">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link"  to="#">Profile</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link"  to="#">Favorites</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link"  to="#">Reservations</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link"  to="#">Chats</Link>
                </li>
            </ul>
        </>
    )
}

export default UserNavbar;