import { useEffect, useRef } from "react";
import UserPlaceCard from "./UserPlaceCard";

function UserPlacesList({ places, selectedPlace, setSelectedPlace }) {
    const cardRefs = useRef({});

    useEffect(() => {
        if (!selectedPlace) {
            return;
        }

        const selectedCard = cardRefs.current[String(selectedPlace.id)];
        if (!selectedCard) {
            return;
        }

        selectedCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest"
        });
    }, [selectedPlace]);

    return (
        <div className="user-places__list">
            {places.length > 0 ? (
                <div className="user-places__list-grid">
                    {places.map((place) => (
                        <UserPlaceCard
                            ref={(element) => {
                                const placeId = String(place.id);
                                if (!element) {
                                    delete cardRefs.current[placeId];
                                    return;
                                }

                                cardRefs.current[placeId] = element;
                            }}
                            placeObj={place}
                            key={place.id}
                            isSelected={String(place.id) === String(selectedPlace?.id)}
                            onSelect={() => setSelectedPlace(place)}
                        />
                    ))}
                </div>
            ) : (
                <p className="user-places__empty">No places available for the current filter.</p>
            )}
        </div>
    );
}

export default UserPlacesList;
