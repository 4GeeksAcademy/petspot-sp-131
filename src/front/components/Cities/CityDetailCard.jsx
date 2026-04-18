import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

function CityDetailCard() {

    const { store } = useGlobalReducer();
    const { id } = useParams();
    const activeCity = store.cities.find((city) => city.id === Number(id))

    if (!activeCity) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>City not found</p>
    }

    return (
        <>
            <div className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div>
                    <span className="fw-bold">City name: </span>{activeCity.city}
                </div>
            </div>
        </>
    )
}

export default CityDetailCard;
