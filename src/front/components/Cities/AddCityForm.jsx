import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import toTitleCase from "../../utils/toTitleCase";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function AddCityForm() {
    const [cityName, setCityName] = useState("")

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedCityName = cityName.trim()

        if (!trimmedCityName) {
            alert("Please enter a city name.")
            return
        }

        const formattedCityName = toTitleCase(trimmedCityName)
        const cityAlreadyExists = store.cities.some((city) => city.city.toLowerCase() === formattedCityName.toLowerCase())

        if (cityAlreadyExists) {
            alert("This city already exists.")
            return
        }

        const body = {
            city: formattedCityName
        }

        async function addCity() {
            try {
                const response = await fetch(`${backendUrl}/api/cities`, {
                    method: "POST",
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

                const newCity = await response.json()
                dispatch({
                    type: "ADD_CITY",
                    payload: newCity
                })
                navigate("/cities")
            } catch (error) {
                alert("Unable to add the city right now. Please try again.")
            }
        }

        addCity()
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

export default AddCityForm;
