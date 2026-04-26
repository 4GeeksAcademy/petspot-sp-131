import UserPlaceCard from "./UserPlaceCard"
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserPlacesList() {

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getPlaces() {
            try {
                const response = await fetch(`${backendUrl}/api/places`)
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`)
                }
                const responseJSON = await response.json()
                dispatch({
                    type: "GET_PLACES",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load places right now. Please try again.")
            }
        }
        getPlaces()
    }, [])


    return (
        <>
            {store.places.length > 0
                ? store.places.map((place) => {
                    return <UserPlaceCard placeObj={place} key={place.id} />
                })
                : (
                    <p className="text-center">No places yet</p>
                    )}
        </>
    )
}

export default UserPlacesList;
