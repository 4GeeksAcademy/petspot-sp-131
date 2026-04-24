import { Outlet } from "react-router-dom";
import UserDashboard from "./UserDashboard";
import UserNavbar from "../../components/UserPrivate/UserNavbar";


function UserLayout() {
    return (
        <>
            <UserNavbar />
            <Outlet />
        </>
    )
}

export default UserLayout;