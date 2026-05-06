import Home2Navbar from "../components/home2/Home2Navbar";
import Home2HeroSection from "../components/home2/Home2HeroSection";
import Home2CitiesSection from "../components/home2/Home2CitiesSection";
import Home2HowItWorksSection from "../components/home2/Home2HowItWorksSection";
import Home2EstablishmentsCarousel from "../components/home2/Home2EstablishmentsCarousel";
import Home2BusinessesSection from "../components/home2/Home2BusinessesSection";
import Home2ExplorePlacesSection from "../components/home2/Home2ExplorePlacesSection";
import Home2PhotoCollageSection from "../components/home2/Home2PhotoCollageSection";
import Home2ReviewsSection from "../components/home2/Home2ReviewsSection";
import Home2LatestNewsSection from "../components/home2/Home2LatestNewsSection";
import "../styles/home2.css";

function Home2() {
    return (
        <div className="home2-page">
            <header className="home2-page__header">
                <Home2Navbar />
            </header>

            <main className="home2-page__main">
                <section className="home2-page__section">
                    <Home2HeroSection />
                </section>
                <section className="home2-page__section">
                    <Home2CitiesSection />
                </section>
                <section className="home2-page__section">
                    <Home2HowItWorksSection />
                </section>
                <section className="home2-page__section">
                    <Home2EstablishmentsCarousel />
                </section>
                <section className="home2-page__section">
                    <Home2BusinessesSection />
                </section>
                <section className="home2-page__section">
                    <Home2ExplorePlacesSection />
                </section>
                <section className="home2-page__section">
                    <Home2PhotoCollageSection />
                </section>
                <section className="home2-page__section">
                    <Home2ReviewsSection />
                </section>
                <section className="home2-page__section">
                    <Home2LatestNewsSection />
                </section>
            </main>

           
        </div>
    );
}

export default Home2;
