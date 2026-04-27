import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import UserPlacesList from "../../components/UserPrivate/UserPlaces/UserPlacesList";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserDashboard() {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()
    console.log(store.privateUser)
    useEffect(() => {
        async function getPrivateUser() {
            try {
                const userToken = localStorage.getItem("userToken") || localStorage.getItem("tokenUser")
                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                })
                if (response.status === 401) {
                    localStorage.removeItem("userToken")
                    localStorage.removeItem("tokenUser")
                    dispatch({
                        type: "USER_LOGOUT"
                    })
                    navigate("/login/user", { replace: true })
                    return
                }
                const responseJSON = await response.json()

                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to reach the server right now. Please try again.")
            }
        }
        getPrivateUser()
    }, [])


    return (
        <>
            <div  style={{ maxWidth: 800 }} className="mx-auto text-center p-3 my-5">
                <h1 className="display-5 text-center mb-5">Welcome back <span className="fw-bold">{store.privateUser.name}</span> 👤</h1>
                <p className="text-center mb-5">Discover pet-friendly cafés, restaurants, and bars around you, all in one place. Browse new spots, check what other pet owners are saying, save your favorites, and plan your next outing with your pet. Whether it’s a relaxed coffee, a nice dinner, or drinks with friends, you and your pet are always welcome here.</p>
                <Link to="/user/private/news" className="btn btn-success btn-lg">
                    View latest news
                </Link>
            </div>
            <UserPlacesList />
        </>
    )
}

export default UserDashboard;
