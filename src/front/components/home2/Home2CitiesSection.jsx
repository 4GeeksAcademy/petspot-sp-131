import { useEffect, useMemo, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { getPlaces } from "../../services/userPrivateService";
import fallbackPlaceImage from "../../assets/img/rigo-baby.jpg";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Home2CitiesSection() {
    const { store, dispatch } = useGlobalReducer();
    const [currentPage, setCurrentPage] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(4);

    useEffect(() => {
        const updateCardsPerView = () => {
            if (window.innerWidth < 576) {
                setCardsPerView(1);
                return;
            }

            if (window.innerWidth < 992) {
                setCardsPerView(2);
                return;
            }

            if (window.innerWidth < 1200) {
                setCardsPerView(3);
                return;
            }

            setCardsPerView(4);
        };

        updateCardsPerView();
        window.addEventListener("resize", updateCardsPerView);

        return () => window.removeEventListener("resize", updateCardsPerView);
    }, []);

    useEffect(() => {
        if (store.citiesWithPlaces.length > 0) return;

        const loadCitiesWithPlaces = async () => {
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
                console.error("Unable to load cities with places for Home2:", error);
            }
        };

        loadCitiesWithPlaces();
    }, [dispatch, store.citiesWithPlaces.length]);

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
                console.error("Unable to load places for Home2 cities section:", error);
            }
        };

        loadPlaces();
    }, [dispatch, store.places.length]);

    const cities = useMemo(() => {
        return store.citiesWithPlaces.map(cityObj => {
            const relatedPlace = store.places.find(place => String(place.city?.id) === String(cityObj.id) && place.image_url);

            return {
                ...cityObj,
                image: relatedPlace?.image_url || fallbackPlaceImage
            };
        });
    }, [store.citiesWithPlaces, store.places]);

    const totalPages = Math.max(1, Math.ceil(cities.length / cardsPerView));
    const trackWidth = cities.length > 0
        ? `${Math.max(cities.length, cardsPerView) * (100 / cardsPerView)}%`
        : "100%";

    useEffect(() => {
        setCurrentPage(previousPage => Math.min(previousPage, totalPages - 1));
    }, [totalPages]);

    const offset = `${currentPage * (100 / totalPages)}%`;

    const handlePrevious = () => {
        setCurrentPage(previousPage => Math.max(previousPage - 1, 0));
    };

    const handleNext = () => {
        setCurrentPage(previousPage => Math.min(previousPage + 1, totalPages - 1));
    };

    return (
        <section className="home2-cities" aria-labelledby="home2-cities-title">
            <div className="container">
                <div className="home2-cities__header">
                    <h2 id="home2-cities-title" className="home2-cities__title">
                        Cities we have places in
                    </h2>

                    <div className="home2-cities__controls">
                        <button
                            type="button"
                            className="home2-cities__arrow"
                            onClick={handlePrevious}
                            disabled={currentPage === 0}
                            aria-label="Previous cities"
                        >
                            <i className="fa-solid fa-arrow-left-long" />
                        </button>
                        <button
                            type="button"
                            className="home2-cities__arrow"
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            aria-label="Next cities"
                        >
                            <i className="fa-solid fa-arrow-right-long" />
                        </button>
                    </div>
                </div>

                <div className="home2-cities__carousel">
                    <div
                        className="home2-cities__track"
                        style={{
                            width: trackWidth,
                            transform: `translateX(-${offset})`
                        }}
                    >
                        {cities.length === 0 && (
                            <article className="home2-cities__empty">
                                <p>No cities with active places available yet.</p>
                            </article>
                        )}

                        {cities.map(cityObj => (
                            <article
                                key={cityObj.id}
                                className="home2-cities__card"
                                style={{ width: `${100 / Math.max(cities.length, cardsPerView)}%` }}
                            >
                                <h3 className="home2-cities__name">{cityObj.city}</h3>
                                <div className="home2-cities__image-shell">
                                    <img
                                        src={cityObj.image}
                                        alt={`${cityObj.city} pet-friendly places`}
                                        className="home2-cities__image"
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home2CitiesSection;
