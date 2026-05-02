import UserPlaceCard from "./UserPlaceCard"
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import { getPlaces } from "../../../services/userPrivateService";

function UserPlacesList({ setRadius, radius }) {

    const { store, dispatch } = useGlobalReducer();
    const [nearbyPlaces, setNearbyPlaces] = useState(true)

    const userHasLocation = store.privateUser.latitude && store.privateUser.longitude ? true : false

    useEffect(() => {
        if (!userHasLocation) {
            setNearbyPlaces(false)
        }
    }, [])


    return (
        <>

            <div>
                <div className="d-flex justify-content-center my-4">
                    <button className={`btn me-3 shadow-0 ${nearbyPlaces === true ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setNearbyPlaces(true)} disabled={!userHasLocation}>
                        View Nearby Places
                    </button>
                    <button className={`btn me-3 shadow-0 ${nearbyPlaces === false ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setNearbyPlaces(false)} >
                        View All Places
                    </button>
                </div>
                {nearbyPlaces === true && <p className=" mx-auto text-center mb-2 form-control" style={{ maxWidth: 800 }}>{"\u{1F4CC}"} Places near <span className="fw-bold">{store.privateUser.address}</span> </p>}
                {nearbyPlaces === true &&
                    <div className="input-group mx-auto mb-3" style={{ maxWidth: 200 }}>
                        <input type="numeric" className="form-control text-center" value={radius} aria-label="radius" aria-describedby="basic-addon1" onChange={(e) => setRadius(Number(e.target.value))} />
                        <span className="input-group-text" id="basic-addon1">km</span>
                    </div>
                }
                {nearbyPlaces === true
                    ?
                    store.nearbyPlaces.map((place) => {
                        return <UserPlaceCard placeObj={place} key={place.id} />
                    })
                    : store.places.map((place) => {
                        return <UserPlaceCard placeObj={place} key={place.id} />

                    })
                }
            </div>
        </>
    )
}

export default UserPlacesList;
