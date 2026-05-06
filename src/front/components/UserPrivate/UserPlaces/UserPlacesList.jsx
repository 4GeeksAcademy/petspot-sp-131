import UserPlaceCard from "./UserPlaceCard";

function UserPlacesList({ places, selectedPlace, setSelectedPlace }) {
    return (
        <div className="user-places__list">
            {places.length > 0 ? (
                <div className="user-places__list-grid">
                    {places.map((place) => (
                        <UserPlaceCard
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
