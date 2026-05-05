import { Link } from "react-router-dom";
import LoginPlaceForm from "../../components/Places/LoginPlaceForm";
import placeHero from "../../assets/img/places-hero.png";

function LoginPlace() {

    return (
        <div className="auth-page">

            <div className="auth-hero">
                <h1 className="auth-hero-title">Place Account</h1>

                <div className="auth-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>›</span>
                    <span>Place Login</span>
                </div>

                <div className="auth-hero-image">
                    <img src={placeHero} alt="Waiter with a dog" />
                </div>
            </div>

            <div className="auth-panel">
                <LoginPlaceForm />
            </div>

        </div>
    );
}

export default LoginPlace;