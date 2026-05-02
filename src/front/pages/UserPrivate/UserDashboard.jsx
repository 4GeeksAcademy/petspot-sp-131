import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import UserPlacesList from "../../components/UserPrivate/UserPlaces/UserPlacesList";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getPrivateUser } from "../../services/userPrivateService";
import { getPlaces } from "../../services/userPrivateService";

const backendUrl = import.meta.env.VITE_BACKEND_URL

function UserDashboard() {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()
    const [ radius, setRadius] = useState(10)

    // Get logged in user data
    useEffect(() => {
        async function loadPrivateUser() {
            if (store.privateUser?.id) {
                return;
            }

            try {
                const responseJSON = await getPrivateUser();
                dispatch({
                    type: "GET_PRIVATE_USER",
                    payload: responseJSON
                });
            } catch (error) {
                alert("Unable to load your profile right now. Please try again.");
            }
        }

        loadPrivateUser();
    }, []);

    // Get Places
    useEffect(() => {
        async function loadPlaces() {
            try {
                const responseJSON = await getPlaces();
                dispatch({
                    type: "GET_PLACES",
                    payload: responseJSON
                })

            } catch (error) {
                alert("Unable to load places right now. Please try again.")
            }
        }
        loadPlaces()
    }, [])

    // Get Places based on user location if set
    useEffect(() => {
        async function getNearbyPlaces() {
            try {
                const userToken = localStorage.getItem("userToken");
                if (!userToken) {
                    return;
                }

                const response = await fetch(`${backendUrl}/api/users/private/nearby-places?radius=${radius}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                })

                if (!response.ok) {
                    throw new Error(`User request failed with status ${response.status}`);
                }

                const responseJSON = await response.json()

                dispatch({
                    type: "GET_NEARBY_PLACES",
                    payload: responseJSON
                })


            } catch (error) {
                alert("Unable to load nearby places right now. Please try again.")
            }
        }
        getNearbyPlaces()

    }, [radius])

    return (
        <>
            <div style={{ maxWidth: 800 }} className="mx-auto text-center mt-5">
                <h1 className="display-5 text-center mb-5">Welcome back <span className="fw-bold">{store.privateUser.name}</span> 👤</h1>
                <p className="text-center mb-5">Discover pet-friendly cafés, restaurants, and bars around you, all in one place. Browse new spots, check what other pet owners are saying, save your favorites, and plan your next outing with your pet. Whether it’s a relaxed coffee, a nice dinner, or drinks with friends, you and your pet are always welcome here.</p>
                <Link to="/user/private/news" className="btn btn-success btn-lg mb-4">
                    View latest news
                </Link>
            </div>
            <UserPlacesList setRadius={setRadius} radius={radius} />
        </>
    )
}

export default UserDashboard;
