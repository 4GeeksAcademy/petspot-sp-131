import React from "react";
import { Navbar } from "../components/Navbar";
import AboutHero from "../components/about/AboutHero";
import AboutIntroSection from "../components/about/AboutIntroSection";
import AboutTestimonials from "../components/about/AboutTestimonials";
import AboutPartners from "../components/about/AboutPartners";
import "../styles/about.css";

function About() {
    return (
        <>
            <header>
                <Navbar />
            </header>

            <main className="about-page">
                <AboutHero />
                <AboutIntroSection />
                <AboutTestimonials />
                <AboutPartners />
            </main>
        </>
    );
}

export default About;
