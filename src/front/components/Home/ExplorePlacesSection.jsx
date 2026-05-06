import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import { getPlaces } from "../../services/userPrivateService.js";
import fallbackPlaceImage from "../../assets/img/rigo-baby.jpg";

function ExplorePlacesSection() {
    const { store, dispatch } = useGlobalReducer();
    const [currentPage, setCurrentPage] = useState(0);
    const [placesPerView, setPlacesPerView] = useState(3);

    useEffect(() => {
        const updatePlacesPerView = () => {
            if (window.innerWidth < 768) {
                setPlacesPerView(1);
                return;
            }

            if (window.innerWidth < 992) {
                setPlacesPerView(2);
                return;
            }

            setPlacesPerView(3);
        };

        updatePlacesPerView();
        window.addEventListener("resize", updatePlacesPerView);

        return () => window.removeEventListener("resize", updatePlacesPerView);
    }, []);

    useEffect(() => {
        if (store.places.length > 0) return;

        const loadPlaces = async () => {
            try {
                const places = await getPlaces();
                dispatch({ type: "GET_PLACES", payload: places });
            } catch (error) {
                console.error("Unable to load places for homepage:", error);
            }
        };

        loadPlaces();
    }, [dispatch, store.places.length]);

    const places = useMemo(() => store.places.slice(0, 10), [store.places]);
    const totalPages = Math.max(1, Math.ceil(places.length / placesPerView));
    const trackWidth = places.length > 0
        ? `${Math.max(places.length, placesPerView) * (100 / placesPerView)}%`
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
        <section id="explore-places" className="explore-places">
            <div className="container">
                <div className="explore-places__header">
                    <h2 className="explore-places__title">Explore Places</h2>

                    <div className="explore-places__controls">
                        <button
                            type="button"
                            className="explore-places__arrow"
                            onClick={handlePrevious}
                            disabled={currentPage === 0}
                            aria-label="Previous places"
                        >
                            <i className="fa-solid fa-arrow-left-long" />
                        </button>
                        <button
                            type="button"
                            className="explore-places__arrow"
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            aria-label="Next places"
                        >
                            <i className="fa-solid fa-arrow-right-long" />
                        </button>
                    </div>
                </div>

                <div className="explore-places__carousel">
                    <div
                        className="explore-places__track"
                        style={{
                            width: trackWidth,
                            transform: `translateX(-${offset})`
                        }}
                    >
                        {places.length === 0 && (
                            <article className="explore-places__empty">
                                <p>No places available yet. Check back soon for pet-friendly spots.</p>
                            </article>
                        )}

                        {places.map(place => {
                            const placeType = place.establishment_type
                                ? place.establishment_type.charAt(0).toUpperCase() + place.establishment_type.slice(1)
                                : "Place";
                            const location = place.city?.city
                                ? `${place.city.city}, Spain`
                                : place.address || "Pet-friendly location";

                            return (
                                <article
                                    key={place.id}
                                    className="explore-places__card"
                                    style={{ width: `${100 / Math.max(places.length, placesPerView)}%` }}
                                >
                                    <div className="explore-places__card-shadow" aria-hidden="true" />
                                    <div className="explore-places__card-inner">
                                        <img
                                            src={place.image_url || fallbackPlaceImage}
                                            alt={place.name}
                                            className="explore-places__image"
                                        />
                                        <span className="explore-places__badge">{placeType}</span>
                                        <h3 className="explore-places__name">{place.name}</h3>
                                        <p className="explore-places__location">{location}</p>
                                        <Link to="/user/login" className="explore-places__button">
                                            View details
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="explore-places__footer">
                    <div className="explore-places__dots">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`explore-places__dot${index === currentPage ? " explore-places__dot--active" : ""}`}
                                aria-label={`Go to places slide ${index + 1}`}
                                onClick={() => setCurrentPage(index)}
                            />
                        ))}
                    </div>

                    <Link to="/user/login" className="explore-places__view-more">
                        View more
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ExplorePlacesSection;
