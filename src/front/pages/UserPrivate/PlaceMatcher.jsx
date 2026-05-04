import React, { useEffect, useState } from "react";
import { handleAddToFavorites } from "../../services/userPrivateService";

function PlaceMatcher() {
    const [places, setPlaces] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState("");

    async function handleLike() {
        try {
            await handleAddToFavorites(currentPlace.id);
            console.log("Favorite saved:", currentPlace.name);

            goToNextPlace("right");

            setTimeout(async () => {
                await getPlaces();
            }, 300);

        } catch (error) {
            console.error("Error adding favorite:", error);
            goToNextPlace("right");
        }
    }

    function handleDislike() {
        goToNextPlace("left");
    }

    async function getPlaces() {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const userToken = localStorage.getItem("userToken");

            const response = await fetch(`${backendUrl}/api/users/private/not-favorites`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });
            const data = await response.json();

            console.log("PLACES FROM API:", data);

            setPlaces(data);
        } catch (error) {
            console.error("Error fetching places:", error);
        }
    }

    useEffect(() => {
        getPlaces();
    }, []);

    const currentPlace = places[currentIndex];

    function goToNextPlace(direction) {
        setSwipeDirection(direction);

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setSwipeDirection("");
        }, 300);
    }

    return (
        <div className="container py-5 text-center">
            <h1 className="display-4 mb-3">Place Matcher</h1>

            <p className="text-body-secondary">
                Find places based on your preferences.
            </p>

            {places.length > 0 && !currentPlace && (
                <>
                    <div className="alert alert-info mx-auto mt-4" style={{ maxWidth: 500 }}>
                        No more places to show.
                    </div>

                    <button
                        className="btn btn-primary mt-3"
                        onClick={() => setCurrentIndex(0)}
                    >
                        Restart
                    </button>
                </>
            )}

            {currentPlace && (
                <>
                    <div
                        className="card mx-auto mt-4 shadow-sm"
                        style={{
                            maxWidth: 420,
                            transition: "transform 0.3s ease, opacity 0.3s ease",
                            transform:
                                swipeDirection === "right"
                                    ? "translateX(250px) rotate(12deg)"
                                    : swipeDirection === "left"
                                        ? "translateX(-250px) rotate(-12deg)"
                                        : "translateX(0)",
                            opacity: swipeDirection ? 0 : 1
                        }}
                    >
                        {currentPlace.image_url && (
                            <img
                                src={currentPlace.image_url}
                                className="card-img-top"
                                alt={currentPlace.name}
                                style={{ height: "260px", objectFit: "cover" }}
                            />
                        )}

                        <div className="card-body text-start">
                            <h2 className="card-title h4">{currentPlace.name}</h2>

                            <p className="card-text mb-1">
                                <strong>Type:</strong> {currentPlace.establishment_type}
                            </p>

                            <p className="card-text mb-1">
                                <strong>City:</strong> {currentPlace.city?.city || "No city"}
                            </p>

                            <p className="card-text text-body-secondary">
                                {currentPlace.pet_rules || "No pet rules available."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 d-flex justify-content-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline-danger border-2 fw-bold px-4 py-2"
                            onClick={handleDislike}
                            aria-label={`Dislike ${currentPlace.name}`}
                        >
                            <span aria-hidden="true">✕</span> Dislike
                        </button>

                        <button
                            type="button"
                            className="btn btn-success fw-bold px-4 py-2"
                            onClick={handleLike}
                            aria-label={`Like ${currentPlace.name}`}
                        >
                            <span aria-hidden="true">♥</span> Like
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default PlaceMatcher;