import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Asterisk, Menu, MoveRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import blueskyLogo from "./assets/bluesky-logo.png";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    number: "01",
    title: "Aether House",
    type: "Hospitality / Digital",
    year: "2025",
    className: "project-aether",
    label: "AETHER",
  },
  {
    number: "02",
    title: "Sora Objects",
    type: "Commerce / Identity",
    year: "2025",
    className: "project-sora",
    label: "SORA",
  },
  {
    number: "03",
    title: "Nocturne FM",
    type: "Culture / Experience",
    year: "2024",
    className: "project-nocturne",
    label: "NOCTURNE",
  },
];

const services = [
  ["01", "Strategy", "Positioning, research, and a clear digital roadmap."],
  ["02", "Web Design", "Art direction and interfaces with a distinct point of view."],
  ["03", "Development", "Fast, expressive websites built with modern technology."],
  ["04", "Motion", "Purposeful interaction and 3D moments that make brands felt."],
];

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const heroObject = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-line > span", {
        yPercent: 115,
        duration: 1.15,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.1,
      });
      gsap.from(".hero-fade", {
        opacity: 0,
        y: 22,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.6,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 70,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".project-visual").forEach((visual) => {
        gsap.fromTo(
          visual.querySelector(".project-art"),
          { scale: 1.1, yPercent: -4 },
          {
            scale: 1,
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });

      gsap.to(".marquee-track", {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".marquee",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      gsap.to(heroObject.current, {
        rotateZ: 22,
        y: 180,
        scale: 0.78,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!heroObject.current) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * -18;
      gsap.to(heroObject.current, {
        rotateY: x,
        rotateX: y,
        duration: 1.2,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div ref={root} className="site-shell">
      <header className="site-header">
        <a href="#top" className="logo" aria-label="Bluesky Webstudio home">
          <img className="brand-logo-image" src={blueskyLogo} alt="" />
          <span>BLUESKY</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#services">Services</a>
        </nav>
        <a href="#contact" className="header-cta">
          Start a project <ArrowUpRight size={15} />
        </a>
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`}>
        {["Work", "Studio", "Services", "Contact"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
            {item}
          </a>
        ))}
      </div>

      <main>
        <section className="hero" id="top">
          <div className="hero-eyebrow hero-fade">
            <span className="pulse-dot" />
            Independent creative studio · Worldwide
          </div>

          <div className="hero-object-wrap" aria-hidden="true">
            <div className="hero-object" ref={heroObject}>
              <div className="hero-logo-card">
                <img src={new URL("./imports/1795499433940.png", import.meta.url).href} alt="" />
              </div>
            </div>
          </div>

          <div className="hero-title" aria-label="We make brands move">
            <div className="hero-line">
              <span>WE MAKE</span>
            </div>
            <div className="hero-line hero-line-indent">
              <span>BRANDS</span>
            </div>
            <div className="hero-line">
              <span>
                MOVE<span className="blue-dot">.</span>
              </span>
            </div>
          </div>

          <div className="hero-bottom hero-fade">
            <p>
              Bluesky Webstudio creates bold digital experiences for ambitious brands ready to move
              culture forward.
            </p>
            <a href="#work" className="circle-link" aria-label="Explore selected work">
              <ArrowDown size={21} />
            </a>
          </div>
          <span className="hero-index hero-fade">© 2025 / 001</span>
        </section>

        <section className="intro" id="studio">
          <div className="section-kicker" data-reveal>
            <span>01</span> The studio
          </div>
          <p className="statement" data-reveal>
            We pair sharp strategy with <em>expressive design</em> to build digital places people
            want to stay.
          </p>
          <div className="intro-meta" data-reveal>
            <p>
              Small by design.
              <br />
              Big on impact.
            </p>
            <p>
              Working at the intersection of brand, technology, and motion, we turn good ideas into
              unforgettable digital experiences.
            </p>
          </div>
        </section>

        <section className="work" id="work">
          <div className="section-heading" data-reveal>
            <div className="section-kicker">
              <span>02</span> Selected work
            </div>
            <h2>
              Projects with
              <br />a pulse.
            </h2>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.title} data-reveal>
                <div className={`project-visual ${project.className}`}>
                  <div className="project-art">
                    <div className="art-grid" />
                    <div className="art-orb" />
                    <span>{project.label}</span>
                  </div>
                  <div className="project-arrow">
                    <ArrowUpRight />
                  </div>
                </div>
                <div className="project-info">
                  <span>{project.number}</span>
                  <h3>{project.title}</h3>
                  <p>{project.type}</p>
                  <span>{project.year}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div className="marquee-group" key={group}>
                <span>DESIGN</span>
                <Asterisk />
                <span>DEVELOP</span>
                <Asterisk />
                <span>DISRUPT</span>
                <Asterisk />
              </div>
            ))}
          </div>
        </div>

        <section className="services" id="services">
          <div className="services-top" data-reveal>
            <div className="section-kicker">
              <span>03</span> Capabilities
            </div>
            <h2>
              From first thought
              <br />
              to final pixel.
            </h2>
          </div>
          <div className="service-list">
            {services.map(([number, title, description]) => (
              <div className="service-row" key={number} data-reveal>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <ArrowUpRight />
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-orb" aria-hidden="true" />
          <div className="section-kicker light" data-reveal>
            <span>04</span> Let’s make something matter
          </div>
          <h2 data-reveal>
            HAVE AN IDEA?
            <br />
            <em>LET’S TALK.</em>
          </h2>
          <a href="mailto:hello@blueskywebstudio.com" className="contact-link" data-reveal>
            hello@blueskywebstudio.com <MoveRight />
          </a>
          <footer>
            <div className="logo">
              <img className="brand-logo-image" src={blueskyLogo} alt="" />
              <span>BLUESKY</span>
            </div>
            <p>
              Independent digital studio
              <br />
              Available worldwide
            </p>
            <div className="socials">
              <a href="#instagram">Instagram</a>
              <a href="#behance">Behance</a>
              <a href="#linkedin">LinkedIn</a>
            </div>
            <span>© 2025 BLUESKY WEBSTUDIO</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
