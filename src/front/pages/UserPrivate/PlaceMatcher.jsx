import React, { useEffect, useState } from "react";
import { handleAddToFavorites } from "../../services/userPrivateService";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PlaceMatcher() {

    const { store, dispatch } = useGlobalReducer()

    const [places, setPlaces] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentPlace = places[currentIndex];

    async function getUserNotFavorites() {
        try {
            const userToken = localStorage.getItem("userToken");
            if (!userToken) {
                return null;
            }
            const response = await fetch(`${backendUrl}/api/users/private/not-favorites`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`User request failed with status ${response.status}`);
            }

            const responseJSON = await response.json()
            console.log(responseJSON)

            setPlaces(responseJSON)

        } catch (error) {
            alert("Unable to load not favorites places right now. Please try again.");
        }
    }

    // Get places not favorited by the logged-in user.
    // This provides the list of available places the user can still like.
    // The Favorites model prevents the same user from favoriting the same place more than once.
    useEffect(() => {
        getUserNotFavorites()
    }, [])

    // Add to favorites
    async function addToFavorites(id) {
        try {
            const updatedPrivateUser = await handleAddToFavorites(id);
            dispatch({
                type: "GET_PRIVATE_USER",
                payload: updatedPrivateUser
            });
            getUserNotFavorites()
        } catch (error) {
            alert("Unable to add favorite right now. Please try again.");
        }
    }

    return (
        <div className="container py-5 text-center">
            <h1 className="display-4 mb-3">Place Matcher</h1>

            <p className="text-body-secondary">
                Find places based on your preferences.
            </p>

            {places.length === 0 && !currentPlace && (
                <div className="alert alert-info mx-auto mt-4" style={{ maxWidth: 500 }}>
                    No more places to show.
                </div>
            )}

            {places.length > 0 && !currentPlace && <button className="btn btn-primary mt-3" onClick={() => setCurrentIndex(0)}>Restart</button>}

            {currentPlace && (
                <>
                    <div className="card mx-auto mt-4 shadow-sm" style={{ maxWidth: 420 }}>
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
                            onClick={() => setCurrentIndex(currentIndex + 1)}
                            aria-label={`Dislike ${currentPlace.name}`}
                        >
                            <span aria-hidden="true">✕</span> Dislike
                        </button>

                        <button
                            type="button"
                            className="btn btn-success fw-bold px-4 py-2"
                            onClick={() => addToFavorites(places[currentIndex].id)}
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