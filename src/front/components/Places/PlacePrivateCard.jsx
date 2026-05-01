import { useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import LocationMap from "../LocationMap";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function PlacePrivateCard() {

    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        async function getPrivatePlace() {
            try {
                const tokenPlace = localStorage.getItem("token_place")

                if (!tokenPlace) {
                    alert("You need to log in first.")
                    return
                }

                const response = await fetch(`${backendUrl}/api/places/private`, {
                    headers: {
                        Authorization: `Bearer ${tokenPlace}`
                    }
                })

                const responseJSON = await response.json()

                if (!response.ok) {
                    const backendMessage = responseJSON.response || responseJSON.message || "Unknown backend error"
                    alert(`Error ${response.status}: ${backendMessage}`)
                    return
                }

                dispatch({
                    type: "GET_PRIVATE_PLACE",
                    payload: responseJSON
                })
            } catch (error) {
                alert("Unable to load the private place information right now. Please try again.")
            }
        }

        getPrivatePlace()
    }, [])

    const activePlace = store.privatePlace

    if (!activePlace.id) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Place not found</p>
    }

    return (
        <>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-2">
                    <span className="fw-bold">Name: </span>{activePlace.name}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Email: </span>{activePlace.email}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Establishment type: </span>{activePlace.establishment_type}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Address: </span>{activePlace.address}
                </div>
                <LocationMap
                    latitude={activePlace.latitude}
                    longitude={activePlace.longitude}
                    label="Place location"
                />
            </div>
        </>
    )
}

export default PlacePrivateCard;
