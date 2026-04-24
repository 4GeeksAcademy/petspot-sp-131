import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function UserPlaceDetailCard() {

    const { store } = useGlobalReducer();
    const { id } = useParams();
    const activePlace = store.places.find((place) => place.id === Number(id))
    const navigate = useNavigate()

    if (!activePlace) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>Place not found</p>
    }
    console.log(store.places)
    return (
        <>
            <button onClick={() => navigate(-1)}>GO BACK</button>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
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
                <div >
                    <span className="fw-bold">Pet rules: </span>{activePlace.pet_rules ? activePlace.pet_rules : "-"}
                </div>
            </div>
        </>
    )
}

export default UserPlaceDetailCard;