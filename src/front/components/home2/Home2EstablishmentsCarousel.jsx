const establishments = [
    "Pawffee Madrid",
    "The Bark Cafe",
    "Meow Bistro",
    "PetHouse Valencia",
    "Happy Tails Bar",
    "Woof & Wine",
    "Catpuccino Cafe",
    "Paws & Plates",
    "Urban Pets Lounge",
    "Friendly Paws Restaurant"
];

function Home2EstablishmentsCarousel() {
    const loopedEstablishments = [...establishments, ...establishments];

    return (
        <section className="home2-establishments" aria-labelledby="home2-establishments-title">
            <div className="container">
                <h2 id="home2-establishments-title" className="home2-establishments__title">
                    Who trusts us
                </h2>
            </div>

            <div className="home2-establishments__carousel">
                <div className="home2-establishments__track">
                    {loopedEstablishments.map((name, index) => (
                        <article
                            key={`${name}-${index}`}
                            className="home2-establishments__card"
                            aria-label={index >= establishments.length ? undefined : name}
                        >
                            <span className="home2-establishments__name">{name}</span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Home2EstablishmentsCarousel;
