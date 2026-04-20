import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import CityCard from "./CityCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function CitiesList() {

    const { store, dispatch } = useGlobalReducer();
    
        useEffect(() => {
            async function getCities() {
                try {
                    const response = await fetch(`${backendUrl}/api/cities`)
                    if (!response.ok) {
                        throw new Error(`Request failed with status ${response.status}`)
                    }
                    const responseJSON = await response.json()
                    dispatch({
                        type: "GET_CITIES",
                        payload: responseJSON
                    })
    
                } catch (error) {
                    alert("Unable to load cities right now. Please try again.")
                }
            }
            getCities()
        }, [])

    return (
        <>
            {store.cities.length > 0
                ? store.cities.map((city) => {
                    return <CityCard cityObj={city} key={city.id} />
                })
                : "No cities registered yet."}
        </>
    )
}

export default CitiesList;