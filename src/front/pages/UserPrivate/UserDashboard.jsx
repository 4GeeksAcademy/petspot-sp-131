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
    const [radius, setRadius] = useState(10);
    const [city, setCity] = useState("");
    const [selectedPlace, setSelectedPlace] = useState(null);

    const userHasLocation = store.privateUser.latitude && store.privateUser.longitude ? true : false;

    const currentPlaces =
        dataMode === "nearby"
            ? store.nearbyPlaces
            : dataMode === "city"
                ? store.places.filter((place) => String(place.city?.id) === city)
                : store.places;

    useEffect(() => {
        if (!selectedPlace) {
            return;
        }

        const selectedPlaceExists = currentPlaces.some(
            (place) => String(place.id) === String(selectedPlace.id)
        );

        if (!selectedPlaceExists) {
            setSelectedPlace(null);
        }
    }, [currentPlaces, selectedPlace]);

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
        <div className="user-places user-places--dashboard">
            <div className="user-places__hero">
                <h1 className="user-places__heading">
                    Welcome back <span className="fw-bold">{store.privateUser.name}</span> {"\u{1F464}"}
                </h1>
                <p className="user-places__intro">
                    Discover pet-friendly cafes, restaurants, and bars around you, all in one place.
                    Browse new spots, check what other pet owners are saying, save your favorites,
                    and plan your next outing with your pet. Whether it is a relaxed coffee, a nice
                    dinner, or drinks with friends, you and your pet are always welcome here.
                </p>
                <Link to="/user/private/news" className="user-places__news-link">
                    View latest news
                </Link>
            </div>

            <div className="user-places__filters">
                <button
                    className={`user-places__filter-button ${dataMode === "nearby" ? "is-active" : ""}`}
                    onClick={() => setDataMode("nearby")}
                    disabled={!userHasLocation}
                >
                    View Nearby Places
                </button>
                <button
                    className={`user-places__filter-button ${dataMode === "all" ? "is-active" : ""}`}
                    onClick={() => setDataMode("all")}
                >
                    View All Places
                </button>
                <button
                    className={`user-places__filter-button ${dataMode === "city" ? "is-active" : ""}`}
                    onClick={() => setDataMode("city")}
                >
                    Filter by City
                </button>
            </div>

            {dataMode === "nearby" && (
                <div className="user-places__filter-panel">
                    <p className="user-places__filter-copy">
                        {"\u{1F4CC}"} Places near <span className="fw-bold">{store.privateUser.address || "your location"}</span> within <span className="fw-bold">{radius} km</span>
                    </p>
                    <div className="user-places__radius-control">
                        <input
                            type="number"
                            className="user-places__input"
                            value={radius}
                            min="1"
                            aria-label="radius"
                            onChange={(e) => setRadius(Number(e.target.value) || 1)}
                        />
                        <span className="user-places__input-addon">km</span>
                    </div>
                </div>
            )}

            {dataMode === "city" && (
                <div className="user-places__filter-panel">
                    <select
                        className="user-places__select"
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

            <div className="user-places__layout">
                <div className="user-places__list-column">
                    <UserPlacesList
                        places={currentPlaces}
                        selectedPlace={selectedPlace}
                        setSelectedPlace={setSelectedPlace}
                    />
                </div>
                <div className="user-places__map-column">
                    <UserPlacesMap
                        places={currentPlaces}
                        user={store.privateUser}
                        includeUserLocation={dataMode === "nearby" && userHasLocation}
                        selectedPlace={selectedPlace}
                        setSelectedPlace={setSelectedPlace}
                    />
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;
