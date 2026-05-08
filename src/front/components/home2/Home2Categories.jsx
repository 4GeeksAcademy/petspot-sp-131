import { useRef } from "react";

const categories = [
    { name: "Restaurants", icon: "fa-utensils", color: "#ffe1dc" },
    { name: "Hotels", icon: "fa-hotel", color: "#e8f5ff" },
    { name: "Parks", icon: "fa-tree", color: "#dcf5e8" },
    { name: "Beaches", icon: "fa-umbrella-beach", color: "#fff0cf" },
    { name: "Pet Taxi", icon: "fa-car", color: "#eee7ff" },
    { name: "Cafés", icon: "fa-mug-hot", color: "#ffe7ef" }
];

function Home2Categories() {
    const trackRef = useRef(null);

    const scrollCategories = (direction) => {
        if (!trackRef.current) return;

        trackRef.current.scrollBy({
            left: direction === "left" ? -320 : 320,
            behavior: "smooth"
        });
    };

    return (
        <section className="home2-categories">
            <div className="container">
                <div className="home2-categories__header">
                    <h2 className="home2-categories__title">Find places by category</h2>

                    <div className="home2-categories__controls">
                        <button type="button" onClick={() => scrollCategories("left")}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>

                        <button type="button" onClick={() => scrollCategories("right")}>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <div className="home2-categories__carousel" ref={trackRef}>
                    {categories.map((category) => (
                        <article
                            key={category.name}
                            className="home2-categories__card"
                            style={{ backgroundColor: category.color }}
                        >
                            <i className={`fa-solid ${category.icon}`}></i>
                            <h3>{category.name}</h3>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Home2Categories;