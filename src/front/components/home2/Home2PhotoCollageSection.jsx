const collageImages = [
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-02-02.jpg",
        alt: "Woman smiling outdoors with her pet",
        className: "home2-collage__item home2-collage__item--rounded home2-collage__item--position-1"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-03-03.jpg",
        alt: "Pet owner holding a dog",
        className: "home2-collage__item home2-collage__item--rounded home2-collage__item--position-2"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-04-04.jpg",
        alt: "Person walking a dog",
        className: "home2-collage__item home2-collage__item--arch home2-collage__item--position-3"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-05-05.jpg",
        alt: "Two dogs together in a portrait",
        className: "home2-collage__item home2-collage__item--pill home2-collage__item--position-4"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-06-06.jpg",
        alt: "Pet owner hugging a dog",
        className: "home2-collage__item home2-collage__item--pill home2-collage__item--position-5"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-01-01.jpg",
        alt: "Person smiling with a small pet",
        className: "home2-collage__item home2-collage__item--rounded home2-collage__item--position-6"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-07-07.jpg",
        alt: "Dog by the sea with its owner",
        className: "home2-collage__item home2-collage__item--arch home2-collage__item--position-7"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-08-08.jpg",
        alt: "Joyful moment between pet owner and dog",
        className: "home2-collage__item home2-collage__item--pill home2-collage__item--position-8"
    },
    {
        src: "https://petperks.dexignzone.com/xhtml/images/gallery/gallery-01-01.jpg",
        alt: "Pet owner and dog resting together",
        className: "home2-collage__item home2-collage__item--rounded home2-collage__item--position-9"
    }
];

function Home2PhotoCollageSection() {
    return (
        <section className="home2-collage" aria-label="PetSpot community photo collage">
            <div className="home2-collage__grid">
                {collageImages.map(image => (
                    <article key={`${image.src}-${image.alt}`} className={image.className}>
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="home2-collage__image"
                        />
                    </article>
                ))}
            </div>
        </section>
    );
}

export default Home2PhotoCollageSection;
