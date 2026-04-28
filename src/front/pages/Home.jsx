import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();

    const loadMessage = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (!backendUrl) return;
            const response = await fetch(backendUrl + "/api/hello");
            if (response.ok) {
                const data = await response.json();
                dispatch({ type: "set_hello", payload: data.message });
            }
        } catch (error) {
            console.error("Error fetching message:", error);
        }
    };

    useEffect(() => {
        loadMessage();
    }, []);

    return (
        <div className="min-vh-100 bg-light py-5">
            <div className="container">
                {/* Hero Section */}
                <div className="text-center mb-5">
                    <h1 className="display-3 fw-bold text-primary mb-3">PetSpot Portal</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: "600px" }}>
                        The complete ecosystem for pet owners, animal-friendly places, and management.
                    </p>
                    
                    {store.message && (
                        <div className="badge rounded-pill bg-info text-dark px-3 py-2 mt-2 shadow-sm">
                            <i className="fa-solid fa-server me-2"></i>{store.message}
                        </div>
                    )}
                </div>

                {/* Entry Portal Cards */}
                <div className="row g-4 justify-content-center mt-2">
                    {/* User Section */}
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition-all hover-translate-y">
                            <div className="bg-primary py-4">
                                <i className="fa-solid fa-paw fa-3x text-white"></i>
                            </div>
                            <div className="card-body p-4 d-flex flex-column">
                                <h3 className="fw-bold mb-3">Pet Owners</h3>
                                <p className="text-muted mb-4">Manage your pets, find places, and make reservations.</p>
                                <div className="mt-auto d-grid gap-2">
                                    <Link to="/user/login" className="btn btn-primary rounded-pill py-2 fw-bold shadow-sm">
                                        Access Account
                                    </Link>
                                    <Link to="/signup/user" className="btn btn-outline-primary rounded-pill py-2">
                                        Join Today
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Place Section */}
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition-all hover-translate-y">
                            <div className="bg-success py-4">
                                <i className="fa-solid fa-store fa-3x text-white"></i>
                            </div>
                            <div className="card-body p-4 d-flex flex-column">
                                <h3 className="fw-bold mb-3">Establishments</h3>
                                <p className="text-muted mb-4">Manage your business profile, reviews, and reservations.</p>
                                <div className="mt-auto d-grid gap-2">
                                    <Link to="/places/login" className="btn btn-success rounded-pill py-2 fw-bold shadow-sm">
                                        Place Portal
                                    </Link>
                                    <Link to="/signup/place" className="btn btn-outline-success rounded-pill py-2">
                                        Register Business
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Section */}
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition-all hover-translate-y">
                            <div className="bg-dark py-4">
                                <i className="fa-solid fa-shield-dog fa-3x text-white"></i>
                            </div>
                            <div className="card-body p-4 d-flex flex-column">
                                <h3 className="fw-bold mb-3">Administration</h3>
                                <p className="text-muted mb-4">System-wide management of pets, users, and reports.</p>
                                <div className="mt-auto d-grid gap-2">
                                    <Link to="/usuario/admin/login" className="btn btn-dark rounded-pill py-2 fw-bold shadow-sm">
                                        Admin Dashboard
                                    </Link>
                                    <Link to="/usuario/admin/pets" className="btn btn-outline-dark rounded-pill py-2">
                                        Pet Registry
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access / Explore Section */}
                <div className="mt-5 pt-4">
                    <h5 className="text-center text-uppercase fw-bold text-muted mb-4 letter-spacing-1">Explore the Platform</h5>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Link to="/places" className="btn btn-light rounded-pill px-4 shadow-sm">
                            <i className="fa-solid fa-map-location-dot me-2 text-primary"></i>Explore Places
                        </Link>
                        <Link to="/cities" className="btn btn-light rounded-pill px-4 shadow-sm">
                            <i className="fa-solid fa-city me-2 text-success"></i>Cities
                        </Link>
                        <Link to="/news" className="btn btn-light rounded-pill px-4 shadow-sm">
                            <i className="fa-solid fa-newspaper me-2 text-warning"></i>Pet News
                        </Link>
                        <Link to="/chat" className="btn btn-light rounded-pill px-4 shadow-sm">
                            <i className="fa-solid fa-comments me-2 text-info"></i>Community
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
