import UserPlaceCard from "./UserPlaceCard"
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import { getPlaces } from "../../../services/userPrivateService";

function UserPlacesList({ setRadius, radius }) {

    const { store, dispatch } = useGlobalReducer();
    const [viewMode, setViewMode] = useState("all");
    const [city, setCity] = useState("")

    const userHasLocation = store.privateUser.latitude && store.privateUser.longitude ? true : false



    return (
        <>

            <div>
                <div className="d-flex justify-content-center gap-3 my-3 align-items-center flex-wrap">
                    <button className={`btn  shadow-0 ${viewMode === 'nearby' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setViewMode('nearby')} disabled={!userHasLocation} style={{ width: 200 }}>
                        View Nearby Places
                    </button>
                    <button className={`btn  shadow-0 ${viewMode === 'all' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setViewMode('all')} style={{ width: 200 }}>
                        View All Places
                    </button>
                    <button className={`btn shadow-0 ${viewMode === 'city' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setViewMode('city')} style={{ width: 200 }}>
                        Filter by City
                    </button>
                </div>

                {viewMode === 'nearby' &&
                    <>
                        <p className=" mx-auto text-center mb-2 form-control" style={{ maxWidth: 800 }}>{"\u{1F4CC}"} Places near <span className="fw-bold">{store.privateUser.address}</span> </p>
                        <div className="input-group mx-auto mb-3" style={{ maxWidth: 200 }}>
                            <input type="numeric" className="form-control text-center" value={radius} aria-label="radius" aria-describedby="basic-addon1" onChange={(e) => setRadius(Number(e.target.value))} />
                            <span className="input-group-text" id="basic-addon1">km</span>
                        </div>
                        {store.nearbyPlaces.map((place) => {
                            return <UserPlaceCard placeObj={place} key={place.id} />
                        })}
                    </>
                }

                {viewMode === 'all' &&
                    store.places.map((place) => {
                        return <UserPlaceCard placeObj={place} key={place.id} />
                    })
                }

                {viewMode === 'city' &&
                    <>
                        <div className="input-group mx-auto mb-3" style={{ maxWidth: 200 }}>
                            <select className="form-select text-center" aria-label="Default select example " value={city} onChange={(e) => setCity(Number(e.target.value))}>
                                <option value="">Select a city</option>
                                {store.cities.map((cityObj, index) => (
                                    <option value={String(cityObj.id)} key={`${cityObj.city}-${index}`}>
                                        {cityObj.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {store.places.filter((place) => place.city.id === city).map((place) => {
                            return <UserPlaceCard placeObj={place} key={place.id} />
                        })}
                    </>
                }
            </div>
        </>
    )
}

export default UserPlacesList;
