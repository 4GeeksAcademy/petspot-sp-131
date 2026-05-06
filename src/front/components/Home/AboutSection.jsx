const teamImage =
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2561&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const teamMembers = [
    { name: "Fatima Olea" },
    { name: "Jairo Xxx" },
    { name: "Ramon Xxx" }
];

function AboutSection() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <h2 className="about-section__title">About us</h2>
                <p className="about-section__text">
                    PetSpot was created with the goal of making everyday experiences with pets easier, more connected
                    and more enjoyable for everyone.
                </p>

                <div className="about-section__team">
                    {teamMembers.map(member => (
                        <article key={member.name} className="about-section__member">
                            <div className="about-section__image-wrapper">
                                <img src={teamImage} alt={member.name} className="about-section__image" />

                                <div className="about-section__overlay">
                                    <a href="#" className="about-section__social-link" aria-label={`${member.name} LinkedIn`}>
                                        <i className="fa-brands fa-linkedin-in" />
                                    </a>
                                    <a href="#" className="about-section__social-link" aria-label={`${member.name} website`}>
                                        <i className="fa-solid fa-globe" />
                                    </a>
                                </div>
                            </div>

                            <p className="about-section__name">{member.name}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AboutSection;
