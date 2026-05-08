import { useState } from "react";
import { Link } from "react-router-dom";
import businessImage from "../../assets/img/business.jpg";

const businessSteps = [
    {
        title: "Manage your place",
        description:
            "Create and customize your establishment profile with pet rules, photos and useful information.",
        cta: "Register your establishment"
    },
    {
        title: "Reservation management",
        description:
            "Organize reservations, manage table availability and keep track of busy hours.",
        cta: "Register your establishment"
    },
    {
        title: "Connect with customers",
        description:
            "Chat directly with pet owners and answer questions before their visit.",
        cta: "Register your establishment"
    },
    {
        title: "Grow your visibility",
        description:
            "Reach a community actively searching for pet-friendly experiences.",
        cta: "Register your establishment"
    }
];

function Home2BusinessesSection() {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const activeStep = businessSteps[activeStepIndex];

    return (
        <section id="for-businesses" className="home2-businesses" aria-labelledby="home2-businesses-title">
            <div className="container">
                <h2 id="home2-businesses-title" className="home2-businesses__title">
                    For businesses ready to welcome pets
                </h2>

                <div className="home2-businesses__layout">
                    <div className="home2-businesses__list" role="tablist" aria-label="PetSpot business features">
                        {businessSteps.map((step, index) => {
                            const isActive = activeStepIndex === index;

                            return (
                                <button
                                    key={step.title}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`home2-businesses__list-item${isActive ? " home2-businesses__list-item--active" : ""}`}
                                    onClick={() => setActiveStepIndex(index)}
                                    onMouseEnter={() => setActiveStepIndex(index)}
                                >
                                    <span>{step.title}</span>
                                    <span className="home2-businesses__arrow" aria-hidden="true">
                                        <i className="fa-solid fa-arrow-right-long" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <article className="home2-businesses__card">
                        <span className="home2-businesses__card-eyebrow">Business Tools</span>
                        <h3 className="home2-businesses__card-title">{activeStep.title}</h3>
                        <p className="home2-businesses__card-text">{activeStep.description}</p>
                        <Link to="/places/signup" className="home2-businesses__button">
                            {activeStep.cta}
                        </Link>
                    </article>

                    <div className="home2-businesses__visual">
                        <img
                            src={businessImage}
                            alt=""
                            className="home2-businesses__hero-image"
                        />
                    </div>

                    {/* <div className="home2-businesses__visuals" aria-hidden="true">
                        <div className="home2-businesses__badge home2-businesses__badge--top">Business dashboard</div>

                        <div className="home2-businesses__image-card home2-businesses__image-card--top">
                            <div className="home2-businesses__panel">
                                <span className="home2-businesses__panel-label">Profile Setup</span>
                                <strong className="home2-businesses__panel-title">Pet rules and place details</strong>
                                <div className="home2-businesses__panel-tags">
                                    <span>Dog friendly</span>
                                    <span>Outdoor seating</span>
                                    <span>Updated photos</span>
                                </div>
                            </div>
                        </div>

                        <div className="home2-businesses__image-card home2-businesses__image-card--bottom">
                            <div className="home2-businesses__stats">
                                <div className="home2-businesses__stat">
                                    <span>Reservations</span>
                                    <strong>+42%</strong>
                                </div>
                                <div className="home2-businesses__stat">
                                    <span>Messages</span>
                                    <strong>24 open</strong>
                                </div>
                                <div className="home2-businesses__stat">
                                    <span>Reach</span>
                                    <strong>Pet owners nearby</strong>
                                </div>
                            </div>
                        </div>

                        <div className="home2-businesses__badge home2-businesses__badge--bottom">
                            Visibility, bookings, connection
                        </div>
                    </div> */}
                </div>
            </div>
        </section>
    );
}

export default Home2BusinessesSection;
