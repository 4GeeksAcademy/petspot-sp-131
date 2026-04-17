import toTitleCase from "../../utils/toTitleCase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function AddPlaceForm() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [placeName, setPlaceName] = useState("")
    const [establishmentType, setEstablishmentType] = useState("")
    const [newLocation, setNewLocation] = useState("")
    const [placeLocations, setPlaceLocations] = useState([])
    const [petRules, setPetRules] = useState("")

    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();


    function handleSubmit(event) {
        event.preventDefault()

        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()
        const trimmedPlaceName = placeName.trim()
        const trimmedPetRules = petRules.trim()

        if (!trimmedEmail || !trimmedPassword || !trimmedPlaceName || !establishmentType) {
            alert("Please complete all required fields before submitting the form.")
            return
        }

        if (placeLocations.length === 0) {
            alert("Please add at least one location before submitting the form.")
            return
        }

        if (trimmedPetRules && trimmedPetRules.length > 250) {
            alert("Pet rules cannot exceed 250 characters.")
            return
        }

        const body = {
            email: trimmedEmail,
            password: trimmedPassword,
            name: trimmedPlaceName,
            establishment_type: establishmentType,
            locations: placeLocations,
            pet_rules: trimmedPetRules
        }

        async function addPlace() {
            try {
                const response = await fetch(`${backendUrl}/api/places`, {
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
                const newPlace = await response.json()
                

                dispatch({
                    type: "ADD_PLACE",
                    payload: newPlace
                })
                navigate("/places")

            } catch (error) {
                console.log('Add place', error)
            }
        }
        addPlace()
        
    }

    function handleAddLocation(event) {
        event.preventDefault()
        const trimmedLocation = newLocation.trim()
        if (!trimmedLocation) {
            alert("Please enter a location.")
            return
        }
        const formattedLocation = toTitleCase(trimmedLocation)
        if (placeLocations.includes(formattedLocation)) {
            alert(`"${formattedLocation}" has already been added. Please enter a different location.`)
            return
        }
        setPlaceLocations([...placeLocations, formattedLocation])
        setNewLocation("")
    }

    function handleLocationKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault()
            handleAddLocation(event)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="placeEmail" className="form-label">Email *</label>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-control" id="placeEmail" name="email" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="placePassword" className="form-label">Password *</label>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="form-control" id="placePassword" name="password" required />
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
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeBar" value="bar" required />
                        <label className="form-check-label" htmlFor="establishmentTypeBar">
                            Bar
                        </label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeCafe" value="cafe" required />
                        <label className="form-check-label" htmlFor="establishmentTypeCafe">
                            Cafe
                        </label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeRestaurant" value="restaurant" required />
                        <label className="form-check-label" htmlFor="establishmentTypeRestaurant">
                            Restaurant
                        </label>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="placeLocation" className="form-label">Locations *</label>
                    <div className="mb-2 ms-2"> {placeLocations.length !== 0 ?
                        placeLocations.map((location) => {
                            return (
                                <span key={location} className="me-3 fw-bold">{location}
                                    <button type="button" className="border-0 btn-sm ms-1" onClick={() => setPlaceLocations(placeLocations.filter((currentLocation) => currentLocation !== location))}>x</button>
                                </span>
                            )
                        })
                        : <span className="fst-italic small">No locations added</span>}
                    </div>
                    <div className="input-group">
                        <input onKeyDown={handleLocationKeyDown} onChange={(event) => setNewLocation(event.target.value)} value={newLocation} type="text" className="form-control" id="placeLocation" name="location" aria-label="Add a location" />
                        <button type="button" className="btn btn-primary" onClick={handleAddLocation}>Add location</button>
                    </div>
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

export default AddPlaceForm;
