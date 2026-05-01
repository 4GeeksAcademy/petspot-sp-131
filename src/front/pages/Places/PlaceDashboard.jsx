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
        <div className="container-fluid px-4 py-5" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom">
                <div>
                    <h1 className="fw-bold mb-0" style={{ color: "#1a237e", letterSpacing: "-1px" }}>
                        <i className="fa-solid fa-gauge-high me-3 text-primary"></i>Dashboard
                    </h1>
                    <p className="text-muted mb-0 ms-5">{store.privatePlace.name} control center</p>
                </div>
                <div className="d-flex gap-2">
                    <Link to="/places/private" className="btn btn-white shadow-sm border-0 rounded-pill px-4">
                        <i className="fa-solid fa-user me-2"></i> Profile
                    </Link>
                    <Link to="/places/private/edit" className="btn btn-primary shadow rounded-pill px-4" style={{ background: "linear-gradient(45deg, #1a237e, #0d47a1)", border: "none" }}>
                        <i className="fa-solid fa-gear me-2"></i> Settings
                    </Link>
                </div>
            </div>
            
            {/* Drag and Drop Board */}
            <div className="row mb-5">
                <div className="col-12">
                    <PlaceReservationBoard placeId={store.privatePlace.id} />
                </div>
            </div>
            
            {/* Statistics View */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: "20px" }}>
                        <div className="card-header bg-white py-4 px-4 border-0">
                            <h5 className="mb-0 fw-bold"><i className="fa-solid fa-chart-line me-2 text-primary"></i>Business Insights</h5>
                        </div>
                        <div className="card-body p-4 bg-light">
                            <PlaceStatisticsView placeId={store.privatePlace.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaceDashboard;
