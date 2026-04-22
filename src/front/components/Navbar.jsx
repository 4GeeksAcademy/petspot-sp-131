import React from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">React Boilerplate</span>
                </Link>

                <div className="ml-auto d-flex gap-2">
                    <Link to="/reservations">
                        <button className="btn btn-primary">Reservations</button>
                    </Link>

                    <Link to="/news">
                        <button className="btn btn-primary">News</button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};