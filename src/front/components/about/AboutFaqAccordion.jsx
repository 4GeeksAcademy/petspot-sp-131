import React, { useState } from "react";

const faqItems = [
    {
        question: "Why did PetSpot start?",
        answer:
            "PetSpot was created to make everyday plans with pets feel easier, warmer, and more connected. We help pet owners discover welcoming places without second-guessing whether their companion will be truly included."
    },
    {
        question: "What makes PetSpot different?",
        answer:
            "We focus on trusted, community-shaped discovery. That means clearer information, friendly experiences, and a design that helps people find places where pets are genuinely welcome, not just tolerated."
    },
    {
        question: "Who is PetSpot built for?",
        answer:
            "PetSpot is built for pet owners, local businesses, and communities that want more shared spaces. It supports people planning outings and businesses that want to connect with pet-loving customers."
    }
];

function AboutFaqAccordion() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div className="about-faq" aria-label="Frequently asked questions">
            {faqItems.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                    <div
                        key={item.question}
                        className={`about-faq__item${isOpen ? " is-open" : ""}`}
                    >
                        <button
                            type="button"
                            className="about-faq__question"
                            aria-expanded={isOpen}
                            onClick={() => setOpenIndex(current => (current === index ? -1 : index))}
                        >
                            <span>{item.question}</span>
                            <span className="about-faq__icon" aria-hidden="true">
                                {isOpen ? "-" : "+"}
                            </span>
                        </button>

                        <div className="about-faq__panel" aria-hidden={!isOpen}>
                            <div className="about-faq__answer">
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default AboutFaqAccordion;
