import pawLine from "../../assets/img/paw-line.png";
import pawLineTwo from "../../assets/img/paw-line2.png";
import coupleCafe from "../../assets/img/happy-couple-outdoors-near-cafe.jpg";
import dogTreats from "../../assets/img/view-adorable-chihuahua-dog-getting-some-treats-home.jpg";
import ownerDoor from "../../assets/img/happy-bar-owner-holding-dog-while-opening-entrance-door-looking-camera.jpg";
import fallbackDogImage from "../../assets/img/cute-dog-with-his-owner-garden.jpg";

const steps = [
    {
        number: "1",
        icon: "fa-magnifying-glass",
        title: "Find places",
        description: "Explore pet-friendly cafes, bars and restaurants near you."
    },
    {
        number: "2",
        icon: "fa-shield-dog",
        title: "Check pet rules",
        description: "See accepted pets, restrictions and useful information before visiting."
    },
    {
        number: "3",
        icon: "fa-calendar-days",
        title: "Reserve and connect",
        description: "Book a table and chat directly with establishments when needed."
    },
    {
        number: "4",
        icon: "fa-heart",
        title: "Enjoy together",
        description: "Create better experiences for you and your pet."
    }
];

const galleryImages = [
    { src: dogTreats, alt: "Dog enjoying treats at a cafe table" },
    { src: coupleCafe, alt: "Happy couple outdoors near a cafe with their dog" },
    { src: ownerDoor, alt: "Bar owner holding a dog while opening the entrance door" },
    { src: fallbackDogImage, alt: "Pet-friendly coffee moment with a happy dog" }
];

function HowItWorksSection() {
    return (
        <section id="how-it-works" className="how-it-works">
            <div className="container">
                <h2 className="how-it-works__title">How it works for pet owners</h2>

                <div className="how-it-works__content">
                    <img
                        src={pawLineTwo}
                        alt=""
                        aria-hidden="true"
                        className="how-it-works__paw-line how-it-works__paw-line--left"
                    />

                    <div className="how-it-works__steps">
                        {steps.map(step => (
                            <article key={step.number} className="how-it-works__step">
                                <span className="how-it-works__number">{step.number}</span>
                                <div className="how-it-works__icon">
                                    <i className={`fa-solid ${step.icon}`} />
                                </div>
                                <div className="how-it-works__text">
                                    <h3 className="how-it-works__step-title">{step.title}</h3>
                                    <p className="how-it-works__step-description">{step.description}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <img
                        src={pawLine}
                        alt=""
                        aria-hidden="true"
                        className="how-it-works__paw-line how-it-works__paw-line--right"
                    />
                </div>

                <div className="how-it-works__gallery" aria-hidden="true">
                    {galleryImages.map(image => (
                        <img
                            key={image.alt}
                            src={image.src}
                            alt={image.alt}
                            className="how-it-works__gallery-image"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorksSection;
