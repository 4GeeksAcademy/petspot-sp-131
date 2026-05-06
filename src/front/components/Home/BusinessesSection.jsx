import { Link } from "react-router-dom";
import ForBusinessesImage from "../../assets/img/forbusinesses.svg";

const businessItems = [
    {
        title: "Manage your place",
        text: "Create and customize your establishment profile with pet rules, photos and useful information."
    },
    {
        title: "Reservation management",
        text: "Organize reservations, manage table availability and keep track of busy hours."
    },
    {
        title: "Connect with customers",
        text: "Chat directly with pet owners and answer questions before their visit."
    },
    {
        title: "Grow your visibility",
        text: "Reach a community actively searching for pet-friendly experiences."
    }
];

function BusinessesSection() {
    return (
        <section id="for-businesses" className="businesses-section">
            <div className="container">
                <div className="businesses-section__header">
                    <h2 className="businesses-section__title">For Businesses</h2>
                    <p className="businesses-section__subtitle">
                        Manage your pet-friendly establishment from <span className="businesses-section__highlight">one place.</span>
                    </p>
                </div>

                <div className="businesses-section__content">
                    <div className="businesses-section__image-wrapper">
                        <img
                            src={ForBusinessesImage}
                            alt="Dashboard illustration for pet-friendly business management"
                            className="businesses-section__image"
                        />
                    </div>

                    <div className="businesses-section__details">
                        {businessItems.map(item => (
                            <article key={item.title} className="businesses-section__item">
                                <h3 className="businesses-section__item-title">{item.title}</h3>
                                <p className="businesses-section__item-text">{item.text}</p>
                            </article>
                        ))}

                        <Link to="/places/signup" className="businesses-section__button">
                            Register your establishment
                        </Link>
                    </div>
                </div>

                <div className="businesses-section__contact-banner">
                    <p className="businesses-section__contact-text">
                        Questions? Get in touch and we&apos;ll guide you through the setup process.
                    </p>
                    <a href="#" className="businesses-section__contact-button">
                        Get in touch
                    </a>
                </div>
            </div>
        </section>
    );
}

export default BusinessesSection;
