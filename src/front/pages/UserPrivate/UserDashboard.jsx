import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import UserPlacesList from "../../components/UserPrivate/UserPlaces/UserPlacesList";
import { Navigate, useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserDashboard() {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()

    useEffect(() => {
        async function getPrivateUser() {
            try {
                const userToken = localStorage.getItem("tokenUser")
                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                })
                if (response.status === 401) {
                    navigate('/')
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
            <h1 className="display-5 text-center my-5">Hello {store.privateUser.name} 👤</h1>
            <UserPlacesList />
        </>
    )
}

export default UserDashboard;
