import React, { useState } from "react";

const dogImage =
    "https://petperks.dexignzone.com/xhtml/images/shop/about-dog.png";

const testimonials = [
    {
        quote:
            "PetSpot helped us find places that actually welcome dogs instead of just allowing them. It made weekend plans feel effortless.",
        name: "Lucia M.",
        role: "Pet owner"
    },
    {
        quote:
            "As a business, PetSpot gave us visibility with exactly the audience we wanted to serve: people who love going out with their pets.",
        name: "Marco R.",
        role: "Cafe partner"
    },
    {
        quote:
            "The experience feels warm, clear, and community-driven. It genuinely saves time when we want to explore a new area with our dog.",
        name: "Nina & Coco",
        role: "Community members"
    }
];

function AboutTestimonials() {
    const [activeIndex, setActiveIndex] = useState(0);

    const showPrevious = () => {
        setActiveIndex(current => (current === 0 ? testimonials.length - 1 : current - 1));
    };

    const showNext = () => {
        setActiveIndex(current => (current === testimonials.length - 1 ? 0 : current + 1));
    };

    const activeTestimonial = testimonials[activeIndex];

    return (
        <section className="about-testimonials">
            <div className="container">
                <div className="about-testimonials__layout">
                    <div className="about-testimonials__visual">
                        <div className="about-testimonials__shape about-testimonials__shape--one" />
                        <div className="about-testimonials__shape about-testimonials__shape--two" />
                        <div className="about-testimonials__pet-wrap">
                            <img
                                src={dogImage}
                                alt="Illustrated dog"
                                className="about-testimonials__pet"
                            />
                        </div>
                    </div>

                    <div className="about-testimonials__content">
                        <span className="about-testimonials__eyebrow">Community Love</span>
                        <h2 className="about-testimonials__title">
                            Real feedback from people and places growing with PetSpot.
                        </h2>

                        <article className="about-testimonials__card">
                            <p className="about-testimonials__quote">"{activeTestimonial.quote}"</p>
                            <div className="about-testimonials__meta">
                                <div>
                                    <strong>{activeTestimonial.name}</strong>
                                    <span>{activeTestimonial.role}</span>
                                </div>

                                <div className="about-testimonials__arrows" aria-label="Testimonial navigation">
                                    <button type="button" onClick={showPrevious} aria-label="Previous testimonial">
                                        <i className="fa-solid fa-arrow-left" />
                                    </button>
                                    <button type="button" onClick={showNext} aria-label="Next testimonial">
                                        <i className="fa-solid fa-arrow-right" />
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutTestimonials;
