import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import PlaceReservationBoard from "../../components/Places/PlaceReservationBoard";
import PlaceStatisticsView from "../../components/Places/PlaceStatisticsView";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function PlaceDashboard() {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPrivatePlace() {
            const tokenPlace = localStorage.getItem("token_place");
            if (!tokenPlace) {
                alert("Please log in first.");
                navigate("/places/login");
                return;
            }

            if (!store.privatePlace?.id) {
                try {
                    const response = await fetch(`${backendUrl}/api/places/private`, {
                        headers: {
                            Authorization: `Bearer ${tokenPlace}`
                        }
                    });
                    
                    if (response.ok) {
                        const responseJSON = await response.json();
                        dispatch({
                            type: "GET_PRIVATE_PLACE",
                            payload: responseJSON
                        });
                    }
                } catch (error) {
                    console.error("Unable to load private place", error);
                }
            }
        }

        loadPrivatePlace();
    }, [dispatch, navigate, store.privatePlace]);

    if (!store.privatePlace?.id) {
        return <div className="text-center mt-5">Loading dashboard...</div>;
    }

    return (
        <div className="container-fluid mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="display-6">Dashboard - {store.privatePlace.name}</h2>
                <div>
                    <Link to="/places/private" className="btn btn-outline-secondary me-2">Back to Profile</Link>
                </div>
            </div>
            
            <hr />

            {/* Drag and Drop Board */}
            <div className="row mb-5">
                <div className="col-12">
                    <PlaceReservationBoard placeId={store.privatePlace.id} />
                </div>
            </div>
            
            {/* Statistics could go here */}
            <div className="row mb-5">
                <div className="col-12">
                    <PlaceStatisticsView placeId={store.privatePlace.id} />
                </div>
            </div>
        </div>
    );
}

export default PlaceDashboard;
