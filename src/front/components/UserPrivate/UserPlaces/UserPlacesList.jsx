import UserPlaceCard from "./UserPlaceCard"
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect } from "react";
import { getPlaces } from "../../../services/userPrivateService";

function UserPlacesList() {

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function loadPlaces() {
            try {
                const responseJSON = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load places right now. Please try again.")
            }
        }
        loadPlaces()
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
