import PlaceCard from "./PlaceCard";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useEffect } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function PlacesList() {

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
                console.log('Get places', error)
            }
        }
        getPlaces()
    }, [])


    return (
        <>
            {store.places.length > 0
                ? store.places.map((place) => {
                    return <PlaceCard placeObj={place} key={place.id} />
                })
                : "No places registered yet."}
        </>
    )
}

export default PlacesList;
