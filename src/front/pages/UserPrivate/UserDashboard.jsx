import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import UserPlacesList from "../../components/UserPrivate/UserPlaces/UserPlacesList";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserDashboard() {

    const { store, dispatch } = useGlobalReducer();
    console.log(store.privateUser)

    useEffect(() => {
        async function getPrivateUser() {
            try {
                const userToken = localStorage.getItem("tokenUser")

                const response = await fetch(`${backendUrl}/api/users/private`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                })
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }
                const responseJSON = await response.json()
                console.log(responseJSON)
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load places right now. Please try again.")
            }
        }
        getPrivateUser()
    }, [])


    return (
        <>
            <h1>Hello {store.privateUser.name}</h1>
            <UserPlacesList />
        </>
    )
}

export default UserDashboard;
