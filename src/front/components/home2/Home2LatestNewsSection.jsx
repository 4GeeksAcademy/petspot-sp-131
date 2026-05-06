import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function Home2LatestNewsSection() {
    const { store, dispatch } = useGlobalReducer();
    const [currentPage, setCurrentPage] = useState(0);
    const [postsPerView, setPostsPerView] = useState(3);

    useEffect(() => {
        const updatePostsPerView = () => {
            if (window.innerWidth < 768) {
                setPostsPerView(1);
                return;
            }

            if (window.innerWidth < 1200) {
                setPostsPerView(2);
                return;
            }

            setPostsPerView(3);
        };

        updatePostsPerView();
        window.addEventListener("resize", updatePostsPerView);

        return () => window.removeEventListener("resize", updatePostsPerView);
    }, []);

    useEffect(() => {
        if (store.news.length > 0) return;

        const loadNews = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/news`);
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const responseJSON = await response.json();
                dispatch({
                    type: "GET_NEWS",
                    payload: responseJSON
                });
            } catch (error) {
                console.error("Unable to load news for Home2:", error);
            }
        };

        loadNews();
    }, [dispatch, store.news.length]);

    const posts = useMemo(() => store.news.slice(0, 8), [store.news]);
    const totalPages = Math.max(1, Math.ceil(posts.length / postsPerView));
    const trackWidth = posts.length > 0
        ? `${Math.max(posts.length, postsPerView) * (100 / postsPerView)}%`
        : "100%";

    useEffect(() => {
        setCurrentPage(previousPage => Math.min(previousPage, totalPages - 1));
    }, [totalPages]);

    const offset = `${currentPage * (100 / totalPages)}%`;

    const handlePrevious = () => {
        setCurrentPage(previousPage => Math.max(previousPage - 1, 0));
    };

    const handleNext = () => {
        setCurrentPage(previousPage => Math.min(previousPage + 1, totalPages - 1));
    };

    return (
        <section id="latest-news" className="home2-news" aria-labelledby="home2-news-title">
            <div className="container">
                <div className="home2-news__header">
                    <h2 id="home2-news-title" className="home2-news__title">
                        Latest posts
                    </h2>

                    <Link to="/user/login" className="home2-news__view-all">
                        View all
                    </Link>
                </div>

                <div className="home2-news__topbar">
                    <div className="home2-news__controls">
                        <button
                            type="button"
                            className="home2-news__arrow"
                            onClick={handlePrevious}
                            disabled={currentPage === 0}
                            aria-label="Previous news posts"
                        >
                            <i className="fa-solid fa-arrow-left-long" />
                        </button>
                        <button
                            type="button"
                            className="home2-news__arrow"
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            aria-label="Next news posts"
                        >
                            <i className="fa-solid fa-arrow-right-long" />
                        </button>
                    </div>
                </div>

                <div className="home2-news__carousel">
                    <div
                        className="home2-news__track"
                        style={{
                            width: trackWidth,
                            transform: `translateX(-${offset})`
                        }}
                    >
                        {posts.length === 0 && (
                            <article className="home2-news__empty">
                                <p>No news posts available yet.</p>
                            </article>
                        )}

                        {posts.map(post => {
                            const postType = post.post_type
                                ? post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)
                                : "Post";

                            return (
                                <article
                                    key={post.id}
                                    className="home2-news__card"
                                    style={{ width: `${100 / Math.max(posts.length, postsPerView)}%` }}
                                >
                                    <div className="home2-news__card-offset" aria-hidden="true" />
                                    <div className="home2-news__card-inner">
                                        <span className="home2-news__type">{postType}</span>
                                        <h3 className="home2-news__post-title">{post.title}</h3>
                                        <Link to="/user/login" className="home2-news__button">
                                            Read more
                                            <i className="fa-solid fa-arrow-right-long" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home2LatestNewsSection;
