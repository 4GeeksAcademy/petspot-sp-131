import fatimaImage from "../../assets/img/profpic_sq_web.png";
import ramonImage from "../../assets/img/_1 - Ramón - HeadshotPro.png";

const TEAM_MEMBERS = [
    {
        name: "Fátima Olea",
        image: fatimaImage,
        linkedin: "https://www.linkedin.com/in/fatimaolea",
        website: "https://www.fatimaolea.dev/"
    },
    {
        name: "Jairo Martínez",
        image: "",
        linkedin: "https://linkedin.com/",
        website: "#"
    },
    {
        name: "Ramón Camacho",
        image: ramonImage,
        linkedin: "https://www.linkedin.com/in/ramon-camacho-rojas/",
        website: "#"
    }
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
                    {TEAM_MEMBERS.map((member) => (
                        <article key={member.name} className="about-section__member">
                            <div className="about-section__image-wrapper">
                                <img src={member.image} alt={member.name} className="about-section__image" />

                                <div className="about-section__overlay">
                                    <a
                                        href={member.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="about-section__social-link"
                                        aria-label={`${member.name} LinkedIn`}
                                    >
                                        <i className="fa-brands fa-linkedin-in" />
                                    </a>
                                    <a
                                        href={member.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="about-section__social-link"
                                        aria-label={`${member.name} website`}
                                    >
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
