import HeroSection from "../components/Home/HeroSection";
import ExplorePlacesSection from "../components/Home/ExplorePlacesSection";
import HowItWorksSection from "../components/Home/HowItWorksSection";
import BusinessesSection from "../components/Home/BusinessesSection";
import ReviewsSection from "../components/Home/ReviewsSection";
import AboutSection from "../components/Home/AboutSection";

function Home() {

    return (
        <>
            <main className="home">

                <HeroSection />

                <ExplorePlacesSection />

                <HowItWorksSection />

                <BusinessesSection />

                <ReviewsSection />

                <AboutSection />

            </main>

        </>
    );
};

export default Home;