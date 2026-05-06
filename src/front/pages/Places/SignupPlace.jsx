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
        <div className="auth-page">
            <div className="auth-hero">
                <h1 className="auth-hero-title">Place Account</h1>
                <div className="auth-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>›</span>
                    <span>Register Place</span>
                </div>
            </div>

            <div className="auth-panel">
                <form onSubmit={handleSubmit} className="auth-card auth-card-large">
                    <h2 className="auth-title">Register your Place</h2>
                    <p className="auth-subtitle">Create an account for your business</p>

                    <div className="auth-field">
                        <label htmlFor="placeEmail">Email Address *</label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" id="placeEmail" required placeholder="Email Address" />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="placePassword">Password *</label>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" id="placePassword" required placeholder="Password" />
                    </div>

                    <p className="auth-section-text">Fill in the place information below to complete the profile</p>

                    <div className="auth-field">
                        <label htmlFor="placeName">Place Name *</label>
                        <input onChange={(event) => setPlaceName(event.target.value)} value={placeName} type="text" id="placeName" required placeholder="Place name" />
                    </div>

                    <div className="auth-field">
                        <label>Establishment Type *</label>
                        <div className="auth-radio-group">
                            <label className="auth-radio"><input onChange={(event) => setEstablishmentType(event.target.value)} type="radio" name="establishmentType" value="bar" required /> Bar</label>
                            <label className="auth-radio"><input onChange={(event) => setEstablishmentType(event.target.value)} type="radio" name="establishmentType" value="cafe" required /> Cafe</label>
                            <label className="auth-radio"><input onChange={(event) => setEstablishmentType(event.target.value)} type="radio" name="establishmentType" value="restaurant" required /> Restaurant</label>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="placeCity">City *</label>
                        <select id="placeCity" onChange={(event) => setCity(event.target.value)} value={city} required>
                            <option value="">Select a city</option>
                            {store.cities.map((city, i) => (
                                <option value={city.id} key={`${city.city}-${i}`}>{city.city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="petRules">Pet Rules</label>
                        <textarea onChange={(event) => setPetRules(event.target.value)} value={petRules} id="petRules" maxLength="250" placeholder="Optional rules"></textarea>
                    </div>

                    <div className="auth-actions">
                        <button type="submit" className="auth-btn">Register</button>
                        <Link to="/places/login" className="auth-secondary-btn">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SignupPlace;
