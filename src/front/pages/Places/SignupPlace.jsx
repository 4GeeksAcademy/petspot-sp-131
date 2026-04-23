import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function SignupPlace() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [placeName, setPlaceName] = useState("")
    const [establishmentType, setEstablishmentType] = useState("")
    const [city, setCity] = useState("")
    const [petRules, setPetRules] = useState("")

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault()

        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()
        const trimmedPlaceName = placeName.trim()
        const trimmedPetRules = petRules.trim()
        const trimmedCity = city.trim()

        if (!trimmedEmail || !trimmedPassword || !trimmedPlaceName || !establishmentType || !trimmedCity) {
            alert("Please complete all required fields before submitting the form.")
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
            city_id: trimmedCity,
            pet_rules: trimmedPetRules
        }

        async function signupPlace() {
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
                alert("Place registered successfully! Please log in.");
                navigate("/places/login")

            } catch (error) {
                alert("Unable to sign up right now. Please try again.")
            }
        }
        signupPlace()
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
        <div className="container mt-5">
            <h2 className="text-center mb-4">Register your Place</h2>
            <form onSubmit={handleSubmit} className="mx-auto p-5 bg-secondary-subtle border-0 rounded text-start" style={{ maxWidth: 600 }}>
                <div className="mb-3">
                    <label htmlFor="placeEmail" className="form-label">Email *</label>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-control" id="placeEmail" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="placePassword" className="form-label">Password *</label>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="form-control" id="placePassword" required />
                </div>
                <hr className="my-4" />
                <p className="text-body-secondary mb-4 text-center ">
                    Fill in the place information below to complete the profile
                </p>
                <div className="mb-3">
                    <label htmlFor="placeName" className="form-label">Name *</label>
                    <input onChange={(event) => setPlaceName(event.target.value)} value={placeName} type="text" className="form-control" id="placeName" required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Establishment Type *</label>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeBar" value="bar" required />
                        <label className="form-check-label" htmlFor="establishmentTypeBar">Bar</label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeCafe" value="cafe" required />
                        <label className="form-check-label" htmlFor="establishmentTypeCafe">Cafe</label>
                    </div>
                    <div className="form-check">
                        <input onChange={(event) => setEstablishmentType(event.target.value)} className="form-check-input" type="radio" name="establishmentType" id="establishmentTypeRestaurant" value="restaurant" required />
                        <label className="form-check-label" htmlFor="establishmentTypeRestaurant">Restaurant</label>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="placeCity" className="form-label">City *</label>
                    <select className="form-select" id="placeCity" onChange={(event) => setCity(event.target.value)} value={city} required>
                        <option value="">Select a city</option>
                        {store.cities.map((city, i) => (
                            <option value={city.id} key={`${city.city}-${i}`}>{city.city}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="petRules" className="form-label">Pet rules</label>
                    <textarea onChange={(event) => setPetRules(event.target.value)} value={petRules} className="form-control" id="petRules" style={{ maxHeight: 250 }} maxLength="250"></textarea>
                </div>
                <p className="text-body-secondary small mb-4">* Required fields</p>
                <div className="mt-4 text-center">
                    <button type="submit" className="btn btn-success">Sign Up</button>
                    <Link to="/places/login" className="btn btn-outline-secondary ms-3">Already have an account?</Link>
                </div>
            </form>
        </div>
    )
}

export default SignupPlace;
