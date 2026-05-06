import pawLine from "../../assets/img/paw-line.png";
import frenchBulldogOwner from "../../assets/img/beautiful-woman-with-her-cute-french-bulldog-warm-outfit.jpg";
import chihuahuaOwner from "../../assets/img/adorable-chihuahua-dog-with-female-owner.jpg";
import retrieverCafe from "../../assets/img/vertical-shot-young-smiling-man-with-his-dog-golden-retriever-pet-cafe.jpg";

const reviews = [
    {
        text: "Finding places that actually welcome pets used to be frustrating. PetSpot made it simple and reliable.",
        author: "Sophie & Luna"
    },
    {
        text: "I love being able to check pet rules before making a reservation. It saves so much time.",
        author: "Daniel & Milo"
    },
    {
        text: "PetSpot helped us reach more customers looking specifically for pet-friendly cafes.",
        author: "Emma Carter - Cafe Owner"
    }
];

function ReviewsSection() {
    return (
        <section id="reviews" className="reviews-section">
            <div className="container">
                <h2 className="reviews-section__title">What our community says</h2>

                <div className="reviews-section__content">
                    <div className="reviews-section__quotes">
                        <span className="reviews-section__quote-mark" aria-hidden="true">
                            &ldquo;
                        </span>

                        <img src={pawLine} alt="" aria-hidden="true" className="reviews-section__paw-line" />

                        {reviews.map(review => (
                            <article key={review.author} className="reviews-section__review">
                                <p className="reviews-section__text">&ldquo;{review.text}&rdquo;</p>
                                <p className="reviews-section__author">{review.author}</p>
                            </article>
                        ))}
                    </div>

                    <div className="reviews-section__collage">
                        <img
                            src={frenchBulldogOwner}
                            alt="Woman with her french bulldog"
                            className="reviews-section__image reviews-section__image--top"
                        />
                        <img
                            src={chihuahuaOwner}
                            alt="Chihuahua dog with female owner"
                            className="reviews-section__image reviews-section__image--bottom"
                        />
                        <img
                            src={retrieverCafe}
                            alt="Young man with his golden retriever in a pet cafe"
                            className="reviews-section__image reviews-section__image--large"
                        />
                    </div>

                    <div className="reviews-section__stats">
                        <div className="reviews-section__heart-circle">
                            <i className="fa-regular fa-heart" />
                        </div>

                        <div className="reviews-section__stat">
                            <span className="reviews-section__stat-number">500+</span>
                            <span className="reviews-section__stat-label">pet-friendly places</span>
                        </div>

                        <div className="reviews-section__stars" aria-label="5 star rating">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <i key={index} className="fa-solid fa-star" />
                            ))}
                        </div>

                        <div className="reviews-section__stat">
                            <span className="reviews-section__stat-number">4.9</span>
                            <span className="reviews-section__stat-label">average experience</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ReviewsSection;
