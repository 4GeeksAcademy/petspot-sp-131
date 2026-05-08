import React from "react";
import { Link } from "react-router-dom";

const heroImage =
    "https://petperks.dexignzone.com/xhtml/images/about/pic4.jpg";

function AboutHero() {
    return (
        <section
            className="about-hero"
            style={{ backgroundImage: `url(${heroImage})` }}
            aria-label="About Us hero"
        >
            <div className="about-hero__overlay">
                <div className="container">
                    <div className="about-hero__content">
                        <h1 className="about-hero__title">About Us</h1>
                        <p className="about-hero__breadcrumb">
                            <Link to="/">Home</Link>
                            <span>&gt;</span>
                            <span>About Us</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutHero;
