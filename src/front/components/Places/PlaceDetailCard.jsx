import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

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

                <div className="mb-3">
                    <span className="fw-bold">Name: </span>{activePlace.name}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Email: </span>{activePlace.email}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">Establishment type: </span>{activePlace.establishment_type}
                </div>
                <div className="mb-3">
                    <span className="fw-bold">City: </span>
                    {activePlace.city.city}
                </div>
                <div>
                    <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
                </div>

            </div>
        </>
    )
}

export default PlaceDetailCard;