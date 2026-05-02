import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";
import LocationMap from "../LocationMap";

function PlaceDetailCard() {

    const { store } = useGlobalReducer();
    const { id } = useParams();
    const activePlace = store.places.find((place) => place.id === Number(id))

    if (!activePlace) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Place not found</p>
    }

    const { image_url } = activePlace

    return (
        <>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>

                {image_url && (
                    <img
                        src={image_url}
                        alt={activePlace.name}
                        className="img-fluid rounded mb-4"
                        style={{ width: "100%", height: "300px", objectFit: "cover" }}
                    />
                )}

                <div className="mb-2">
                    <span className="fw-bold">Name: </span>{activePlace.name}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Email: </span>{activePlace.email}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Establishment type: </span>{activePlace.establishment_type}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">Address: </span>{activePlace.address}
                </div>
                <div className="mb-2">
                    <span className="fw-bold">City: </span>
                    {activePlace.city.city}
                </div>
                <div className="mb-2">
                    <span className="fw-bold"><i className="fas fa-clock me-1"></i> Hours: </span>
                    {activePlace.start_time && activePlace.end_time ? 
                        `${activePlace.start_time.substring(0, 5)} - ${activePlace.end_time.substring(0, 5)}` : 
                        "Not specified"}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
                </div>
                <LocationMap
                    latitude={activePlace.latitude}
                    longitude={activePlace.longitude}
                    label="Place location"
                />
            </div>
        </>
    )
}

export default PlaceDetailCard;