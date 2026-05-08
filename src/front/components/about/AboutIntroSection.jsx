import React from "react";
import AboutFaqAccordion from "./AboutFaqAccordion";

const collageImages = [
    "https://petperks.dexignzone.com/xhtml/images/about/pic4.jpg",
    "https://petperks.dexignzone.com/xhtml/images/about/pic3.jpg",
    "https://petperks.dexignzone.com/xhtml/images/about/pic5.jpg"
];

const stats = [
    { value: "12K+", label: "Pet-loving members" },
    { value: "850+", label: "Friendly places shared" },
    { value: "96%", label: "Positive community feedback" }
];

function AboutIntroSection() {
    return (
        <section className="about-intro">
            <div className="container">
                <div className="about-intro__grid">
                    <div className="about-intro__images">
                        <div className="about-intro__collage">
                            <img
                                src={collageImages[0]}
                                alt="Pet owner holding a small dog"
                                className="about-intro__collage-image about-intro__collage-image--large"
                            />
                            <img
                                src={collageImages[1]}
                                alt="Woman smiling with her dog"
                                className="about-intro__collage-image"
                            />
                            <img
                                src={collageImages[2]}
                                alt="Dog enjoying an outdoor moment"
                                className="about-intro__collage-image"
                            />
                        </div>

                        <AboutFaqAccordion />

                        <div className="about-stats" aria-label="PetSpot statistics">
                            {stats.map(stat => (
                                <div key={stat.label} className="about-stats__item">
                                    <strong className="about-stats__value">{stat.value}</strong>
                                    <span className="about-stats__label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="about-intro__content">
                        <span className="about-intro__eyebrow">Our Story</span>
                        <h2 className="about-intro__title">
                            We are building a kinder way to explore the world with pets by your side.
                        </h2>
                        <p className="about-intro__text">
                            PetSpot helps people discover pet-friendly spaces with more confidence and less friction.
                            From cafes and terraces to shops and local experiences, we want every outing to feel more
                            welcoming for both humans and their companions.
                        </p>
                        <p className="about-intro__text">
                            What began as a simple idea grew into a community-first platform shaped by real needs,
                            honest reviews, and a shared love for better everyday moments with pets.
                        </p>

                        <div className="about-intro__profile">
                            <div className="about-intro__profile-copy">
                                <span className="about-intro__profile-label">Founder & Team</span>
                                <h3 className="about-intro__profile-name">Pet lovers, designers, and local explorers</h3>
                                <p className="about-intro__profile-text">
                                    We combine product thinking, community care, and local discovery to make PetSpot
                                    feel thoughtful, useful, and genuinely warm.
                                </p>
                            </div>

                            <div className="about-intro__profile-badge">
                                <span>Since 2026</span>
                            </div>
                        </div>

                        <div className="about-intro__feature-image-wrap">
                            <img
                                src={collageImages[0]}
                                alt="Pet-friendly community moment"
                                className="about-intro__feature-image"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutIntroSection;
