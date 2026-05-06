import { Link } from "react-router-dom";

const heroImages = {
    main: "https://petperks.dexignzone.com/xhtml/images/shop/dog-02.png",
    accentOne: "https://petperks.dexignzone.com/xhtml/images/shop/min-3.png",
    accentTwo: "https://petperks.dexignzone.com/xhtml/images/shop/dog-01.png",
    accentThree: "https://petperks.dexignzone.com/xhtml/images/shop/product4.png"
};

function Home2HeroSection() {
    return (
        <section className="home2-hero">
            <div className="container">
                <div className="home2-hero__inner">
                    <div className="home2-hero__content">
                        <span className="home2-hero__eyebrow">PetSpot Landing</span>
                        <h1 className="home2-hero__title">Your pet-friendly city starts here</h1>
                        <p className="home2-hero__subtitle">
                            Search, discover and reserve pet-friendly spots while staying connected with the places
                            that welcome your pets.
                        </p>

                        <div className="home2-hero__actions">
                            <a href="#explore-places" className="home2-hero__button home2-hero__button--primary">
                                Explore places
                            </a>
                            <Link
                                to="/places/signup"
                                className="home2-hero__button home2-hero__button--secondary"
                            >
                                Register your establishment
                            </Link>
                        </div>
                    </div>

                    <div className="home2-hero__visual" aria-hidden="true">
                        <div className="home2-hero__shape home2-hero__shape--large" />
                        <div className="home2-hero__shape home2-hero__shape--small" />
                        <div className="home2-hero__ring home2-hero__ring--one" />
                        <div className="home2-hero__ring home2-hero__ring--two" />

                        <div className="home2-hero__image home2-hero__image--badge">
                            <img src={heroImages.accentOne} alt="" />
                        </div>

                        <div className="home2-hero__image home2-hero__image--main">
                            <img src={heroImages.main} alt="Happy dog featured in PetSpot hero" />
                        </div>

                        <div className="home2-hero__image home2-hero__image--floating home2-hero__image--top">
                            <img src={heroImages.accentTwo} alt="Playful dog detail" />
                        </div>

                        <div className="home2-hero__image home2-hero__image--floating home2-hero__image--bottom">
                            <img src={heroImages.accentThree} alt="Pet product detail" />
                        </div>

                        <div className="home2-hero__mini-card home2-hero__mini-card--left">
                            <span className="home2-hero__mini-label">Pet-friendly spots</span>
                            <strong>120+ new discoveries</strong>
                        </div>

                        <div className="home2-hero__mini-card home2-hero__mini-card--right">
                            <span className="home2-hero__mini-label">Community favorite</span>
                            <strong>Easy booking flow</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home2HeroSection;
