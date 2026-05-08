import HeroSection from "../components/Home/HeroSection";
import ExplorePlacesSection from "../components/Home/ExplorePlacesSection";
import HowItWorksSection from "../components/Home/HowItWorksSection";
import BusinessesSection from "../components/Home/BusinessesSection";
import ReviewsSection from "../components/Home/ReviewsSection";
import HomeLatestNewsSection from "../components/Home/HomeLatestNewsSection";
import AboutSection from "../components/Home/AboutSection";
import { Navbar } from "../components/Navbar";

function Home() {

    return (
        <>
            <header>

                <Navbar />

            </header>
            
            <main className="home">

                <HeroSection />

                <ExplorePlacesSection />

                <HowItWorksSection />

                <BusinessesSection />

                <ReviewsSection />

                <HomeLatestNewsSection />

                <AboutSection />

            </main>

        </>
    );
};

export default Home;
