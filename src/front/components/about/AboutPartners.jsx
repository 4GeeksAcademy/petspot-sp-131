import React from "react";

const partners = [
    "Pet Care Co.",
    "Paws & Coffee",
    "City Walks",
    "Happy Tails",
    "Friendly Stays",
    "Local Bites"
];

function AboutPartners() {
    return (
        <section className="about-partners">
            <div className="container">
                <div className="about-partners__header">
                    <span className="about-partners__eyebrow">Trusted Companies</span>
                    <h2 className="about-partners__title">Partners who believe pet-friendly experiences should feel natural.</h2>
                </div>

                <div className="about-partners__grid">
                    {partners.map(partner => (
                        <div key={partner} className="about-partners__card">
                            <span>{partner}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AboutPartners;
