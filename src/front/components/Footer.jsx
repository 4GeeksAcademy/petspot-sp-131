import { Link } from "react-router-dom";
import LogoPetSpot from "../assets/img/logo/Logo_PetSpot.svg";

function HomeFooter() {
    return (
        <footer className="home-footer">
            <div className="container">
                <div className="home-footer__top row gy-5">
                    <div className="col-lg-5">
                        <div className="home-footer__brand">
                            <Link to="/#top" className="home-footer__logo" aria-label="PetSpot home">
                                <img src={LogoPetSpot} alt="PetSpot" className="home-footer__logo-image" />
                            </Link>

                            <p className="home-footer__description">
                                Helping pet owners discover welcoming places for better experiences together.
                            </p>

                            <div className="home-footer__socials" aria-label="Social media links">
                                <a href="#" aria-label="Instagram">
                                    <i className="fa-brands fa-instagram" />
                                </a>
                                <a href="#" aria-label="Facebook">
                                    <i className="fa-brands fa-facebook" />
                                </a>
                                <a href="#" aria-label="X or Twitter">
                                    <i className="fa-brands fa-x-twitter" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <nav className="home-footer__links" aria-label="Footer navigation">
                            <ul>
                                <li><Link to="/#top">Home</Link></li>
                                <li><Link to="/#how-it-works">How it works for pet owners</Link></li>
                                <li><Link to="/#for-businesses">For Businesses</Link></li>
                            </ul>
                            <ul>
                                <li><Link to="/#reviews">What our community says</Link></li>
                                <li><Link to="/#about">About us</Link></li>
                            </ul>
                        </nav>
                    </div>

                    <div className="col-lg-3">
                        <div className="home-footer__contact">
                            <a href="mailto:hello@petspot.com">
                                <i className="fa-solid fa-envelope" />
                                <span>hello@petspot.com</span>
                            </a>
                            <div>
                                <i className="fa-solid fa-location-dot" />
                                <span>Spain</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="home-footer__divider" />

                <div className="home-footer__bottom">
                    <p>
                        &copy; 2026 <span>PetSpot.</span> All rights reserved.
                    </p>

                    <nav aria-label="Legal links">
                        <ul>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service">Terms of Service</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
}

export default HomeFooter;
