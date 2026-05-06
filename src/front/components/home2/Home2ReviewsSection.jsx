import pawLine from "../../assets/img/paw-line.png";

const reviewImage = "https://petperks.dexignzone.com/xhtml/images/shop/about-01.png";
import { useState } from "react";

const reviews = [
    {
        text: "Finding places that actually welcome pets used to be frustrating. PetSpot made it simple and reliable.",
        name: "Sophie & Luna",
        role: "Pet owner",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
    },
    {
        text: "We discovered new cafes and terraces in our city within minutes. It finally feels easy to plan outings with our dog.",
        name: "Daniel & Milo",
        role: "Pet owner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
    },
    {
        text: "The pet rules and reservation details save so much guesswork. PetSpot makes every visit feel more relaxed from the start.",
        name: "Clara & Nala",
        role: "Pet owner",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
    }
];

function Home2ReviewsSection() {
    const [activeReviewIndex, setActiveReviewIndex] = useState(0);
    const activeReview = reviews[activeReviewIndex];

    const handlePrevious = () => {
        setActiveReviewIndex(current => (current === 0 ? reviews.length - 1 : current - 1));
    };

    const handleNext = () => {
        setActiveReviewIndex(current => (current === reviews.length - 1 ? 0 : current + 1));
    };

    return (
        <section className="home2-reviews" aria-labelledby="home2-reviews-title">
            <div className="container">
                <div className="home2-reviews__card">
                    <div className="home2-reviews__content">
                        <img src={pawLine} alt="" className="home2-reviews__paw-line" aria-hidden="true" />

                        <h2 id="home2-reviews-title" className="home2-reviews__title">
                            What pet lovers say about us?
                        </h2>

                        <p className="home2-reviews__text">
                            “{activeReview.text}”
                        </p>

                        <div className="home2-reviews__footer">
                            <div className="home2-reviews__author">
                                <img
                                    src={activeReview.avatar}
                                    alt={activeReview.name}
                                    className="home2-reviews__avatar"
                                />
                                <div className="home2-reviews__author-info">
                                    <strong className="home2-reviews__author-name">{activeReview.name}</strong>
                                    <span className="home2-reviews__author-role">{activeReview.role}</span>
                                </div>
                            </div>

                            <div className="home2-reviews__controls" aria-label="Review navigation">
                                <button
                                    type="button"
                                    className="home2-reviews__arrow"
                                    aria-label="Previous review"
                                    onClick={handlePrevious}
                                >
                                    <i className="fa-solid fa-arrow-left-long" />
                                </button>
                                <button
                                    type="button"
                                    className="home2-reviews__arrow"
                                    aria-label="Next review"
                                    onClick={handleNext}
                                >
                                    <i className="fa-solid fa-arrow-right-long" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="home2-reviews__visual" aria-hidden="true">
                        <div className="home2-reviews__shape" />
                        <div className="home2-reviews__orbit home2-reviews__orbit--one" />
                        <div className="home2-reviews__orbit home2-reviews__orbit--two" />
                        <div className="home2-reviews__paw home2-reviews__paw--one">
                            <i className="fa-solid fa-paw" />
                        </div>
                        <img
                            src={reviewImage}
                            alt="Happy dog and cat illustration"
                            className="home2-reviews__image"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home2ReviewsSection;
