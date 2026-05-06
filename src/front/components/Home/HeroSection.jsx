import { Link } from "react-router-dom";
import HeroImage from "../../assets/img/heroimg.svg";

function HeroSection() {
    return (
        <section id="top" className="home-hero">
            <div className="container">
                <div className="home-hero__inner">
                    <div className="home-hero__content">
                        <h1 className="home-hero__title">Your pet-friendly city starts here</h1>
                        <p className="home-hero__text">
                            Search, discover and reserve pet-friendly spots while staying connected with the places
                            that welcome your pets.
                        </p>

                        <div className="home-hero__actions">
                            <Link to="/#explore-places" className="home-hero__button home-hero__button--primary">
                                Explore Places
                            </Link>
                            <Link to="/places/signup" className="home-hero__button home-hero__button--secondary">
                                Register your establishment
                            </Link>
                        </div>
                    </div>

                    <div className="home-hero__image-wrapper">
                        <img src={HeroImage} alt="People and pets enjoying a pet-friendly place" className="home-hero__image" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
