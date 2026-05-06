import { useState } from "react";

const featureSteps = [
    {
        title: "Find places",
        description: "Explore pet-friendly cafes, bars and restaurants near you.",
        cta: "Explore places"
    },
    {
        title: "Check pet rules",
        description: "See accepted pets, restrictions and useful information before visiting.",
        cta: "Explore places"
    },
    {
        title: "Reserve and connect",
        description: "Book a table and chat directly with establishments when needed.",
        cta: "Explore places"
    },
    {
        title: "Enjoy together",
        description: "Create better experiences for you and your pet.",
        cta: "Explore places"
    }
];

const visualImages = {
    top: "https://petperks.dexignzone.com/xhtml/images/shop/ser-1.png",
    bottom: "https://petperks.dexignzone.com/xhtml/images/shop/ser-2.png"
};

function Home2HowItWorksSection() {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const activeStep = featureSteps[activeStepIndex];

    return (
        <section id="how-it-works" className="home2-how" aria-labelledby="home2-how-title">
            <div className="container">
                <h2 id="home2-how-title" className="home2-how__title">
                    How it works for pet owners
                </h2>

                <div className="home2-how__layout">
                    <div className="home2-how__list" role="tablist" aria-label="PetSpot pet owner steps">
                        {featureSteps.map((step, index) => {
                            const isActive = activeStepIndex === index;

                            return (
                                <button
                                    key={step.title}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`home2-how__list-item${isActive ? " home2-how__list-item--active" : ""}`}
                                    onClick={() => setActiveStepIndex(index)}
                                    onMouseEnter={() => setActiveStepIndex(index)}
                                >
                                    <span>{step.title}</span>
                                    <span className="home2-how__arrow" aria-hidden="true">
                                        <i className="fa-solid fa-arrow-right-long" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <article className="home2-how__card">
                        <span className="home2-how__card-eyebrow">Featured Step</span>
                        <h3 className="home2-how__card-title">{activeStep.title}</h3>
                        <p className="home2-how__card-text">{activeStep.description}</p>
                        <a href="#explore-places" className="home2-how__button">
                            {activeStep.cta}
                        </a>
                    </article>

                    <div className="home2-how__visuals" aria-hidden="true">
                        

                        <div className="home2-how__image-card home2-how__image-card--top">
                            <img
                                src={visualImages.top}
                                alt=""
                                className="home2-how__image"
                            />
                        </div>

                        <div className="home2-how__image-card home2-how__image-card--bottom">
                            <img
                                src={visualImages.bottom}
                                alt=""
                                className="home2-how__image"
                            />
                        </div>

                       
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home2HowItWorksSection;
