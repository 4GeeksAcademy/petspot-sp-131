import UserPlaceCard from "./UserPlaceCard";

function UserPlacesList({ places }) {
    return (
        <div>
            {places.length > 0 ? (
                places.map((place) => <UserPlaceCard placeObj={place} key={place.id} />)
            ) : (
                <p className="text-center text-muted">No places available for the current filter.</p>
            )}
        </div>
    );
}

export default UserPlacesList;
