import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import toTitleCase from "../../utils/toTitleCase";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function EditCityForm() {
    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const navigate = useNavigate();

    const [cityName, setCityName] = useState("")

    const activeCity = store.cities.find((city) => city.id === Number(id))

    useEffect(() => {
        if (activeCity) {
            setCityName(activeCity.city)
        }
    }, [activeCity])

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedCityName = cityName.trim()

        if (!trimmedCityName) {
            alert("Please enter a city name.")
            return
        }

        const formattedCityName = toTitleCase(trimmedCityName)
        const cityAlreadyExists = store.cities.some((city) => city.id !== Number(id) && city.city.toLowerCase() === formattedCityName.toLowerCase())

        if (cityAlreadyExists) {
            alert("This city name is already being used by another city.")
            return
        }

        const body = {
            city: formattedCityName
        }

        async function updateCity() {
            try {
                const response = await fetch(`${backendUrl}/api/cities/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    const backendMessage = errorData.response || errorData.message || "Unknown backend error"
                    alert(`Error ${response.status}: ${backendMessage}`)
                    return
                }

                const updatedCity = await response.json()
                dispatch({
                    type: "UPDATE_CITY",
                    payload: updatedCity
                })
                navigate("/cities")
            } catch (error) {
                alert("Unable to update the city right now. Please try again.")
            }
        }

        updateCity()
    }

    if (!activeCity && store.cities.length > 0) {
        return <p className="text-center text-body-secondary alert alert-danger mx-auto" style={{ maxWidth: 600 }}>City not found</p>
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
            <div className="mb-3">
                <label htmlFor="cityName" className="form-label">City Name *</label>
                <input
                    onChange={(event) => setCityName(event.target.value)}
                    value={cityName}
                    type="text"
                    className="form-control"
                    id="cityName"
                    name="city"
                    maxLength="120"
                    required
                />
            </div>
            <p className="text-body-secondary small mb-4">* Required field</p>
            <div className="mt-5">
                <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
            </div>
        </form>
    );
}

export default EditCityForm;
