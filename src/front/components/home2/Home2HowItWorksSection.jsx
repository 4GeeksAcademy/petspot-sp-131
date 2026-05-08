
import { useState } from "react";
import userHero from "../../assets/img/user.png";

const featureSteps = [
    {
        title: "Find nearby pet-friendly places",
        description: "Discover restaurants, cafés, parks, beaches and hotels that welcome pets.",
        cta: "Explore places"
    },
    {
        title: "Check pet rules",
        description: "Review accepted pets, restrictions and useful details before visiting.",
        cta: "See details"
    },
    {
        title: "Reserve your spot",
        description: "Book a table or save the place for your next pet-friendly plan.",
        cta: "Start booking"
    },
    {
        title: "Chat with establishments",
        description: "Connect directly with businesses when you need extra information.",
        cta: "Connect now"
    },
    {
        title: "Save favorites",
        description: "Keep your favorite pet-friendly spots ready for future plans.",
        cta: "Save places"
    }
];

function Home2HowItWorksSection() {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const activeStep = featureSteps[activeStepIndex];

    return (
        <section
            id="how-it-works"
            className="home2-how"
            aria-labelledby="home2-how-title"
        >
            <div className="container">

                <h2 id="home2-how-title" className="home2-how__title">
                    Everything you need for pet-friendly plans
                </h2>

                <div className="home2-how__layout">

                    <div
                        className="home2-how__list"
                        role="tablist"
                        aria-label="PetSpot benefits"
                    >
                        {featureSteps.map((step, index) => {
                            const isActive = activeStepIndex === index;

                            return (
                                <button
                                    key={step.title}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`home2-how__list-item${isActive ? " home2-how__list-item--active" : ""
                                        }`}
                                    onClick={() => setActiveStepIndex(index)}
                                    onMouseEnter={() => setActiveStepIndex(index)}
                                >
                                    <span>{step.title}</span>

                                    <span
                                        className="home2-how__arrow"
                                        aria-hidden="true"
                                    >
                                        <i className="fa-solid fa-arrow-right-long" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <article className="home2-how__card">
                        <span className="home2-how__card-eyebrow">
                            Featured step
                        </span>

                        <h3 className="home2-how__card-title">
                            {activeStep.title}
                        </h3>

                        <p className="home2-how__card-text">
                            {activeStep.description}
                        </p>

                        <a
                            href="#explore-places"
                            className="home2-how__button"
                        >
                            {activeStep.cta}
                        </a>
                    </article>

                    <div
                        className="home2-how__visual"
                        aria-hidden="true"
                    >
                        <img
                            src={userHero}
                            alt=""
                            className="home2-how__hero-image"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}

export default Home2HowItWorksSection;

