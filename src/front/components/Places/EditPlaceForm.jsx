import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useParams } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function EditPlaceForm() {

    const { store, dispatch } = useGlobalReducer();
    const { id } = useParams();
    const activePlace = store.places.find((place) => place.id === Number(id))

    const [email, setEmail] = useState("")
    const [placeName, setPlaceName] = useState("")
    const [establishmentType, setEstablishmentType] = useState("")
    const [city, setCity] = useState("")
    const [petRules, setPetRules] = useState("")

    const navigate = useNavigate();

    useEffect(() => {
        if (activePlace) {
            setEmail(activePlace.email)
            setPlaceName(activePlace.name)
            setEstablishmentType(activePlace.establishment_type)
            setCity(String(activePlace.city.id))
            setPetRules(activePlace.pet_rules || "")
        }
    }, [activePlace])

    function handleCityChange(event) {
        const digitsOnlyValue = event.target.value.replace(/\D/g, "")
        setCity(digitsOnlyValue)
    }

    function handleSubmit(event) {
        event.preventDefault()
        const trimmedEmail = email.trim()
        const trimmedPlaceName = placeName.trim()
        const trimmedPetRules = petRules.trim()
        const trimmedCity = city.trim()

        if (!trimmedEmail || !trimmedPlaceName || !establishmentType || !trimmedCity) {
            alert("Please complete all required fields before submitting the form.")
            return
        }

        if (trimmedPetRules && trimmedPetRules.length > 250) {
            alert("Pet rules cannot exceed 250 characters.")
            return
        }

        const body = {
            email: trimmedEmail,
            name: trimmedPlaceName,
            establishment_type: establishmentType,
            city_id: trimmedCity,
            pet_rules: trimmedPetRules
        }

        async function updatePlace() {
            try {
                const response = await fetch(`${backendUrl}/api/places/${id}`, {
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
                const updatedPlace = await response.json()


                dispatch({
                    type: "UPDATE_PLACE",
                    payload: updatedPlace
                })
                navigate("/places")

            } catch (error) {
                alert("Unable to update the place right now. Please try again.")
            }
        }
        updatePlace()

    }

    if (!activePlace && store.places.length > 0) {
        return <p className="text-center text-body-secondary">Place not found.</p>
    }

    useEffect(() => {
            
            if (store.cities.length === 0) {
                async function getCities() {
                    try {
                        const response = await fetch(`${backendUrl}/api/cities`)
                        if (!response.ok) {
                            throw new Error(`Request failed with status ${response.status}`)
                        }
                        const responseJSON = await response.json()
                        dispatch({
                            type: "GET_CITIES",
                            payload: responseJSON
                        })
    
                    } catch (error) {
                        alert("Unable to load cities right now. Please try again.")
                    }
                }
                getCities()
            }
        }, [])

    return (
        <>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="placeEmail" className="form-label">Email *</label>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-control" id="placeEmail" name="email" required />
                </div>
                <div className="mb-3" >
                    <label htmlFor="placePassword" className="form-label opacity-50 fst-italic">Password</label>
                    <input disabled value="" type="password" className="form-control" id="placePassword" name="password" />
                </div>
                <hr className="my-4" />
                <p className="text-body-secondary mb-4 text-center ">
                    Fill in the place information below to complete the profile
                </p>
                <div className="mb-3">
                    <label htmlFor="placeName" className="form-label">Name *</label>
                    <input onChange={(event) => setPlaceName(event.target.value)} value={placeName} type="text" className="form-control" id="placeName" name="name" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Establishment Type *</label>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "bar"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeBar" value="bar" required />
                        <label className="form-check-label" htmlFor="establishmentTypeBar">
                            Bar
                        </label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "cafe"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeCafe" value="cafe" required />
                        <label className="form-check-label" htmlFor="establishmentTypeCafe">
                            Cafe
                        </label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} checked={establishmentType === "restaurant"} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeRestaurant" value="restaurant" required />
                        <label className="form-check-label" htmlFor="establishmentTypeRestaurant">
                            Restaurant
                        </label>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="placeCity" className="form-label">City *</label>
                    <select class="form-select" id="placeCity" onChange={(event) => setCity(event.target.value)} value={city} aria-label="selectCity" required>
                        {store.cities.map((city, i) => {
                            return (
                                <option value={city.id} key={`${city.city}-${i}`}>{city.city}</option>
                            )
                        })}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="petRules" className="form-label">Pet rules</label>
                    <textarea onChange={(event) => setPetRules(event.target.value)} value={petRules} className="form-control" id="petRules" name="petRules" style={{ maxHeight: 250 }} maxLength="250"></textarea>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-5">
                    <button type="submit" className="btn btn-success d-block mx-auto">Submit</button>
                </div>
            </form>
        </>
    )
}

export default EditPlaceForm;
