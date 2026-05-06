import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoPetSpot from "../assets/img/logo/Logo_PetSpot.svg";

const navLinks = [
    { to: "/#how-it-works", label: "How It Works" },
    { to: "/#for-businesses", label: "For Businesses" },
    { to: "/#reviews", label: "What our community says" },
    { to: "/#about", label: "About us" }
];

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        if (!location.hash) return;

        const sectionId = location.hash.replace("#", "");
        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
            requestAnimationFrame(() => {
                targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }, [location]);

    return (
        <header className="home-navbar">
            <div className="container">
                <div className="home-navbar__inner">
                    <Link to="/#top" className="home-navbar__logo" aria-label="PetSpot home" onClick={closeMenu}>
                        <img src={LogoPetSpot} alt="PetSpot logo" />
                    </Link>

                    <button
                        type="button"
                        className={`home-navbar__toggle${isMenuOpen ? " is-open" : ""}`}
                        aria-label="Toggle navigation"
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen(open => !open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div className={`home-navbar__menu${isMenuOpen ? " is-open" : ""}`}>
                        <nav className="home-navbar__links" aria-label="Homepage navigation">
                            {navLinks.map(link => (
                                <Link key={link.label} to={link.to} onClick={closeMenu}>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="home-navbar__actions">
                            <Link to="/user/login" className="home-navbar__login" onClick={closeMenu}>
                                Log in
                            </Link>
                            <Link to="/signup/user" className="home-navbar__signup" onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
