import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const FALLBACK_POSTS = [
    {
        id: "fallback-event",
        title: "Pet-Friendly Space Improvements",
        post_type: "event"
    },
    {
        id: "fallback-normative",
        title: "Important Update on Vaccination Requirements",
        post_type: "normative"
    },
    {
        id: "fallback-news",
        title: "Weekend Guidelines for Pet Owners",
        post_type: "news"
    },
    {
        id: "fallback-news-2",
        title: "New Community Tips for Dining Out With Pets",
        post_type: "news"
    }
];

function getCardsPerView(width) {
    if (width < 768) {
        return 1;
    }

    if (width < 992) {
        return 2;
    }

    return 3;
}

function HomeLatestNewsSection() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState(FALLBACK_POSTS);
    const [activeIndex, setActiveIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(() => getCardsPerView(window.innerWidth));

    useEffect(() => {
        let isMounted = true;

        async function loadNews() {
            try {
                const response = await fetch(`${backendUrl}/api/news`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                if (!isMounted) {
                    return;
                }

                if (Array.isArray(responseJSON) && responseJSON.length > 0) {
                    setPosts(responseJSON);
                }
            } catch (error) {
                console.error("Unable to load latest news for Home:", error);
            }
        }

        loadNews();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        function handleResize() {
            setCardsPerView(getCardsPerView(window.innerWidth));
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const maxIndex = useMemo(
        () => Math.max(0, posts.length - cardsPerView),
        [posts.length, cardsPerView]
    );

    useEffect(() => {
        setActiveIndex((currentIndex) => Math.min(currentIndex, maxIndex));
    }, [maxIndex]);

    const badgeLabelByType = {
        event: "Event",
        normative: "Normative",
        news: "News"
    };

    const cardWidth = `${100 / cardsPerView}%`;
    const translateX = `${(100 / cardsPerView) * activeIndex}%`;

    function handleLoginRedirect() {
        navigate("/user/login");
    }

    return (
        <section className="home-latest-news">
            <div className="container">
                <div className="home-latest-news__header">
                    <h2 className="home-latest-news__title">Latest posts</h2>

                    <div className="home-latest-news__header-actions">


                        <div className="explore-places__controls" aria-label="Latest news carousel controls">
                            <button
                                type="button"
                                className=" explore-places__arrow"
                                aria-label="Previous posts"
                                onClick={() => setActiveIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                                disabled={activeIndex === 0}
                            >
                                <i className="fa-solid fa-arrow-left-long" />
                            </button>
                            <button
                                type="button"
                                className=" explore-places__arrow"
                                aria-label="Next posts"
                                onClick={() => setActiveIndex((currentIndex) => Math.min(maxIndex, currentIndex + 1))}
                                disabled={activeIndex >= maxIndex}
                            >
                               <i className="fa-solid fa-arrow-right-long" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="home-latest-news__carousel">
                    <div
                        className="home-latest-news__track"
                        style={{ transform: `translateX(-${translateX})` }}
                    >
                        {posts.map((post) => (
                            <article
                                className="home-latest-news__slide"
                                key={post.id}
                                style={{ width: cardWidth }}
                            >
                                <div className="home-latest-news__card-shell">
                                    <div className="home-latest-news__card-outline" />
                                    <div className="home-latest-news__card">
                                        <span className="home-latest-news__badge">
                                            {badgeLabelByType[post.post_type] || "News"}
                                        </span>
                                        <h3 className="home-latest-news__card-title">{post.title}</h3>
                                        <button
                                            type="button"
                                            className="home-latest-news__read-more explore-places__button"
                                            onClick={handleLoginRedirect}
                                        >
                                            Read more <span aria-hidden="true">→</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
                <div className="d-flex justify-content-end">

                    <button
                        type="button"
                        className="home-latest-news__view-all explore-places__view-more"
                        onClick={handleLoginRedirect}
                    >
                        View more
                    </button>
                </div>
            </div>
        </section>
    );
}

export default HomeLatestNewsSection;
