import UserPlaceCard from "./UserPlaceCard";

function UserPlacesList({ places, selectedPlace, setSelectedPlace }) {
    return (
        <div
            style={{
                maxHeight: "600px",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "0.5rem"
            }}
        >
            {places.length > 0 ? (
                <div className="d-flex flex-wrap gap-3 align-items-start justify-content-center" >
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
                <p className="text-center text-muted">No places available for the current filter.</p>
            )}
        </div>
    );
}

export default UserPlacesList;
