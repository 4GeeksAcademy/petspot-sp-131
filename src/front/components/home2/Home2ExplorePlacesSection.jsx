import { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { getPlaces } from "../../services/userPrivateService";
import fallbackPlaceImage from "../../assets/img/rigo-baby.jpg";

function Home2ExplorePlacesSection() {
    const { store, dispatch } = useGlobalReducer();
    const [activeCity, setActiveCity] = useState("all");

    useEffect(() => {
        if (store.places.length > 0) return;

        const loadPlaces = async () => {
            try {
                const places = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: places
                });
            } catch (error) {
                console.error("Unable to load places for Home2 explore section:", error);
            }
        };

        loadPlaces();
    }, [dispatch, store.places.length]);

    const cities = useMemo(() => {
        const uniqueCities = Array.from(
            new Set(
                store.places
                    .map(place => place.city?.city)
                    .filter(Boolean)
            )
        );

        return uniqueCities.sort((a, b) => a.localeCompare(b));
    }, [store.places]);

    const filteredPlaces = useMemo(() => {
        const matchingPlaces = activeCity === "all"
            ? store.places
            : store.places.filter(place => place.city?.city === activeCity);

        return matchingPlaces.slice(0, 8);
    }, [activeCity, store.places]);

    return (
        <section id="explore-places" className="home2-explore" aria-labelledby="home2-explore-title">
            <div className="container">
                <div className="home2-explore__header">
                    <h2 id="home2-explore-title" className="home2-explore__title">
                        Explore pet-friendly places
                    </h2>
                </div>

                <div className="home2-explore__filters" role="tablist" aria-label="Filter places by city">
                    <button
                        type="button"
                        className={`home2-explore__filter${activeCity === "all" ? " home2-explore__filter--active" : ""}`}
                        onClick={() => setActiveCity("all")}
                    >
                        All places
                    </button>

                    {cities.map(city => (
                        <button
                            key={city}
                            type="button"
                            className={`home2-explore__filter${activeCity === city ? " home2-explore__filter--active" : ""}`}
                            onClick={() => setActiveCity(city)}
                        >
                            {city}
                        </button>
                    ))}
                </div>

                <div className="home2-explore__grid">
                    {filteredPlaces.length === 0 && (
                        <article className="home2-explore__empty">
                            <p>No places available yet for this city.</p>
                        </article>
                    )}

                    {filteredPlaces.map(place => {
                        const placeType = place.establishment_type
                            ? place.establishment_type.charAt(0).toUpperCase() + place.establishment_type.slice(1)
                            : "Place";
                        const placeAddress = place.address || place.city?.city || "Pet-friendly location";

                        return (
                            <article key={place.id} className="home2-explore__card">
                                <div className="home2-explore__image-wrapper">
                                    <img
                                        src={place.image_url || fallbackPlaceImage}
                                        alt={place.name}
                                        className="home2-explore__image"
                                    />
                                    <button
                                        type="button"
                                        className="home2-explore__heart"
                                        aria-label={`Save ${place.name}`}
                                    >
                                        <i className="fa-regular fa-heart" />
                                    </button>
                                </div>

                                <div className="home2-explore__content">
                                    <span className="home2-explore__type">{placeType}</span>
                                    <h3 className="home2-explore__name">{place.name}</h3>
                                    <p className="home2-explore__address">{placeAddress}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default Home2ExplorePlacesSection;
