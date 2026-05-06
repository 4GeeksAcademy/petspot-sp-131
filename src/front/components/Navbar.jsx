import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LogoPetSpot from "../assets/img/logo/Logo_PetSpot.svg";

const navLinks = [
    { to: "/#explore-places", label: "Explore Places" },
    { to: "/#how-it-works", label: "How It Works" },
    { to: "/#for-businesses", label: "For Businesses" },
    { to: "/#reviews", label: "What our community says" },
    { to: "/#about", label: "About us" }
];

const authModalContent = {
    login: {
        title: "Log in to PetSpot",
        text: "Choose how you want to access your account.",
        options: [
            {
                to: "/user/login",
                title: "Log in as pet owner",
                text: "Access your PetSpot account as a pet owner."
            },
            {
                to: "/places/login",
                title: "Log in as establishment",
                text: "Manage your business account and pet-friendly listing."
            }
        ]
    },
    signup: {
        title: "Join PetSpot",
        text: "Choose the type of account you want to create.",
        options: [
            {
                to: "/signup/user",
                title: "Sign up as pet owner",
                text: "Create your account to explore PetSpot with your pet."
            },
            {
                to: "/places/signup",
                title: "Register your establishment",
                text: "Create a business account and list your establishment."
            }
        ]
    }
};

const AuthChoiceModal = ({ type, onClose }) => {
    if (!type) return null;

    const { title, text, options } = authModalContent[type];

    return (
        <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby={`auth-modal-title-${type}`}>
            <button type="button" className="auth-modal__overlay" aria-label="Close modal" onClick={onClose} />

            <div className="auth-modal__content">
                <button type="button" className="auth-modal__close" aria-label="Close modal" onClick={onClose}>
                    X
                </button>

                <h2 className="auth-modal__title" id={`auth-modal-title-${type}`}>
                    {title}
                </h2>
                <p className="auth-modal__text">{text}</p>

                <div className="auth-modal__options">
                    {options.map(option => (
                        <Link key={option.to} to={option.to} className="auth-modal__option" onClick={onClose}>
                            <span className="auth-modal__option-title">{option.title}</span>
                            <span className="auth-modal__option-text">{option.text}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const location = useLocation();

    const closeMenu = () => setIsMenuOpen(false);
    const closeModal = () => setActiveModal(null);

    const openModal = type => {
        closeMenu();
        setActiveModal(type);
    };

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

    useEffect(() => {
        if (!activeModal) return;

        const handleKeyDown = event => {
            if (event.key === "Escape") {
                closeModal();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeModal]);

    return (
        <>
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
                                <button type="button" className="home-navbar__login" onClick={() => openModal("login")}>
                                    Log in
                                </button>
                                <button type="button" className="home-navbar__signup" onClick={() => openModal("signup")}>
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <AuthChoiceModal type={activeModal} onClose={closeModal} />
        </>
    );
};
