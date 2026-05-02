import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserPlacesList from "../../components/UserPrivate/UserPlaces/UserPlacesList";
import UserPlacesMap from "../../components/UserPrivate/UserPlaces/UserPlacesMap";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { getPlaces, getPrivateUser } from "../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function UserDashboard() {
    const { store, dispatch } = useGlobalReducer();
    const [dataMode, setDataMode] = useState("all");
    const [viewMode, setViewMode] = useState("list");
    const [radius, setRadius] = useState(10);
    const [city, setCity] = useState("");

    const userHasLocation = store.privateUser.latitude && store.privateUser.longitude ? true : false;

    const currentPlaces =
        dataMode === "nearby"
            ? store.nearbyPlaces
            : dataMode === "city"
                ? store.places.filter((place) => String(place.city?.id) === city)
                : store.places;

    // Get logged in user data
    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        loadPrivateUser();
    }, []);

    // Get all places
    useEffect(() => {
        async function loadPlaces() {
            try {
                const responseJSON = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load places right now. Please try again.");
            }
        }

        loadPlaces();
    }, []);

    // Get user's location nearby places
    useEffect(() => {
        async function getNearbyPlaces() {
            if (!userHasLocation) {
                return;
            }

            try {
                const userToken = localStorage.getItem("userToken");
                if (!userToken) {
                    return;
                }

                const response = await fetch(`${backendUrl}/api/users/private/nearby-places?radius=${radius}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`User request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();

                dispatch({
                    type: "GET_NEARBY_PLACES",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load nearby places right now. Please try again.");
            }
        }

        getNearbyPlaces();
    }, [radius, userHasLocation]);

    // Get cities with places
    useEffect(() => {
        async function getCitiesWithPlaces() {
            try {
                const response = await fetch(`${backendUrl}/api/cities/with-places`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                dispatch({
                    type: "GET_CITIES_WITH_PLACES",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load cities right now. Please try again.");
            }
        }

        getCitiesWithPlaces();
    }, []);

    return (
        <>
            <div style={{ maxWidth: 800 }} className="mx-auto text-center mt-5">
                <h1 className="display-5 text-center mb-5">
                    Welcome back <span className="fw-bold">{store.privateUser.name}</span> 👤
                </h1>
                <p className="text-center mb-5">
                    Discover pet-friendly cafes, restaurants, and bars around you, all in one place.
                    Browse new spots, check what other pet owners are saying, save your favorites,
                    and plan your next outing with your pet. Whether it is a relaxed coffee, a nice
                    dinner, or drinks with friends, you and your pet are always welcome here.
                </p>
                <Link to="/user/private/news" className="btn btn-success btn-lg mb-4">
                    View latest news
                </Link>
            </div>

            <div className="d-flex justify-content-center gap-3 my-3 align-items-center flex-wrap">
                <button
                    className={`btn shadow-0 ${dataMode === "nearby" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setDataMode("nearby")}
                    disabled={!userHasLocation}
                    style={{ width: 200 }}
                >
                    View Nearby Places
                </button>
                <button
                    className={`btn shadow-0 ${dataMode === "all" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setDataMode("all")}
                    style={{ width: 200 }}
                >
                    View All Places
                </button>
                <button
                    className={`btn shadow-0 ${dataMode === "city" ? "btn-warning" : "btn-outline-warning"}`}
                    onClick={() => setDataMode("city")}
                    style={{ width: 200 }}
                >
                    Filter by City
                </button>
            </div>

            <div className="d-flex justify-content-center gap-3 mb-4 align-items-center flex-wrap">
                <button
                    className={`btn btn-sm shadow-0 ${viewMode === "map" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setViewMode("map")}
                    style={{ width: 100 }}
                >
                    View Map
                </button>
                <button
                    className={`btn btn-sm shadow-0 ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setViewMode("list")}
                    style={{ width: 100 }}
                >
                    View List
                </button>
            </div>

            {dataMode === "nearby" && (
                <div className="mx-auto mb-4" style={{ maxWidth: 800 }}>
                    <p className="text-center mb-2 form-control">
                        {"\u{1F4CC}"} Places near <span className="fw-bold">{store.privateUser.address || "your location"}</span> within <span className="fw-bold">{radius} km</span>
                    </p>
                    <div className="input-group mx-auto" style={{ maxWidth: 200 }}>
                        <input
                            type="number"
                            className="form-control text-center"
                            value={radius}
                            min="1"
                            aria-label="radius"
                            aria-describedby="radius-addon"
                            onChange={(e) => setRadius(Number(e.target.value) || 1)}
                        />
                        <span className="input-group-text" id="radius-addon">km</span>
                    </div>
                </div>
            )}

            {dataMode === "city" && (
                <div className="input-group mx-auto mb-4" style={{ maxWidth: 240 }}>
                    <select
                        className="form-select text-center"
                        aria-label="Filter places by city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <option value="">Select a city</option>
                        {store.citiesWithPlaces.map((cityObj, index) => (
                            <option value={String(cityObj.id)} key={`${cityObj.city}-${index}`}>
                                {cityObj.city}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {viewMode === "list" && (
                <UserPlacesList places={currentPlaces} />
            )}

            {viewMode === "map" && (
                <UserPlacesMap
                    places={currentPlaces}
                    user={store.privateUser}
                    includeUserLocation={dataMode === "nearby" && userHasLocation}
                />
            )}
        </>
    );
}

export default UserDashboard;
