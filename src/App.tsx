import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Asterisk, Menu, MoveRight, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LOGO_SRC = "/assets/aistudio/New_Project_19eca198.png";
const CRANE_SRC = "/assets/aistudio/a60162bd-0d2d-4455-a334-954954f34d41_a75e5be5.png";

function CraneContainer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = CRANE_SRC;
    img.onload = () => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const total = w * h;
      const isBg = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;

      const isNeutralLight = (idx: number) => {
        const p = idx * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const min = r < g ? (r < b ? r : b) : g < b ? g : b;
        const max = r > g ? (r > b ? r : b) : g > b ? g : b;
        return min >= 195 && max - min <= 18;
      };

      const seed = (x: number, y: number) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (!isBg[idx] && isNeutralLight(idx)) {
          isBg[idx] = 1;
          queue[tail++] = idx;
        }
      };

      for (let x = 0; x < w; x++) {
        seed(x, 0);
        seed(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        seed(0, y);
        seed(w - 1, y);
      }

      // Seed enclosed transparent gaps inside the crane hook and between the cables
      seed(Math.floor(w * 0.5), Math.floor(h * 0.18));
      seed(Math.floor(w * 0.5), Math.floor(h * 0.3));

      while (head < tail) {
        const idx = queue[head++];
        const x = idx % w;
        const y = (idx - x) / w;

        if (x > 0) {
          const n = idx - 1;
          if (!isBg[n] && isNeutralLight(n)) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
        if (x + 1 < w) {
          const n = idx + 1;
          if (!isBg[n] && isNeutralLight(n)) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
        if (y > 0) {
          const n = idx - w;
          if (!isBg[n] && isNeutralLight(n)) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
        if (y + 1 < h) {
          const n = idx + w;
          if (!isBg[n] && isNeutralLight(n)) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
      }

      for (let i = 0; i < total; i++) {
        if (isBg[i]) {
          data[i * 4 + 3] = 0;
        }
      }

      // Soften 1px anti-aliased fringe along newly transparent edges
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          if (isBg[idx]) continue;
          if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - w] || isBg[idx + w]) {
            const p = idx * 4;
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];
            const min = r < g ? (r < b ? r : b) : g < b ? g : b;
            const max = r > g ? (r > b ? r : b) : g > b ? g : b;
            if (min >= 155 && max - min <= 22) {
              const avg = (r + g + b) / 3;
              data[p + 3] = Math.max(0, Math.min(255, Math.round((232 - avg) * 3.2)));
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setReady(true);
    };

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`crane-canvas ${ready ? "is-ready" : ""}`}
      aria-label="BlueskyWeb Studio crane lifting shipping container"
      role="img"
    />
  );
}

interface Project {
  number: string;
  title: string;
  type: string;
  year: string;
  className: string;
  label: string;
  liveUrl?: string;
}

function LiveProjectPreview({
  url,
  title,
  fallbackLabel,
}: {
  url: string;
  title: string;
  fallbackLabel: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1440, height: 720 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        setSize({ width: el.clientWidth, height: el.clientHeight });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const virtualWidth = size.width < 640 ? 1100 : 1440;
  const scale = size.width / virtualWidth;
  const virtualHeight = Math.max(1, Math.round(size.height / scale));

  return (
    <div ref={frameRef} className="project-art project-art-live">
      <div className="live-fallback" aria-hidden="true">
        <div className="art-grid" />
        <div className="art-orb" />
        <span>{fallbackLabel}</span>
      </div>
      <iframe
        src={url}
        title={`${title} live website hero`}
        loading="eager"
        scrolling="no"
        onLoad={() => setLoaded(true)}
        className={`live-preview-iframe ${loaded ? "is-loaded" : ""}`}
        style={{
          width: `${virtualWidth}px`,
          height: `${virtualHeight}px`,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

const projects: Project[] = [
  {
    number: "01",
    title: "Prestige Solar",
    type: "Energy / Digital",
    year: "2025",
    className: "project-prestige",
    label: "PRESTIGE SOLAR",
    liveUrl: "https://prestige-solar-energy-and-electrical-limited.ai.studio",
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
  ["02", "Branding", "Visual identity, typography, and systems that make brands unmistakable."],
  ["03", "Web Design", "Art direction and interfaces with a distinct point of view."],
  ["04", "Development", "Fast, expressive websites built with modern technology."],
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
        const art = visual.querySelector(".project-art");
        if (!art || art.classList.contains("project-art-live")) return;
        gsap.fromTo(
          art,
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
        rotateZ: 18,
        y: 70,
        scale: 0.86,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      const craneTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".contact",
          start: "top 92%",
          end: "bottom bottom",
          scrub: 1.15,
        },
      });

      craneTimeline
        .fromTo(
          ".crane-rig",
          {
            z: -340,
            scale: 0.44,
            xPercent: 14,
            yPercent: -34,
            rotateX: 28,
            rotateY: -40,
            rotateZ: -12,
            opacity: 0.12,
          },
          {
            z: -80,
            scale: 0.84,
            xPercent: -4,
            yPercent: -6,
            rotateX: -6,
            rotateY: 10,
            rotateZ: 5,
            opacity: 1,
            duration: 0.62,
            ease: "power2.out",
          },
        )
        .to(".crane-rig", {
          z: 0,
          scale: 1,
          xPercent: 0,
          yPercent: 0,
          rotateX: 0,
          rotateY: -3,
          rotateZ: 0,
          opacity: 1,
          duration: 0.38,
          ease: "power3.out",
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
          <img className="brand-logo-image" src={LOGO_SRC} alt="" />
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
                <img src={LOGO_SRC} alt="" />
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
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`project-visual ${project.className}`}
                    aria-label={`Open ${project.title} live website`}
                  >
                    <LiveProjectPreview
                      url={project.liveUrl}
                      title={project.title}
                      fallbackLabel={project.label}
                    />
                    <span className="project-live-badge">
                      <span className="live-dot" />
                      Live preview · Open site
                    </span>
                    <div className="project-arrow">
                      <ArrowUpRight />
                    </div>
                  </a>
                ) : (
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
                )}
                <div className="project-info">
                  <span>{project.number}</span>
                  <h3>
                    {project.liveUrl ? (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
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
          <div className="contact-main">
            <div className="contact-copy">
              <div className="section-kicker" data-reveal>
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
            </div>
            <div className="crane-stage">
              <div className="crane-rig">
                <div className="crane-pendulum">
                  <div className="crane-cables" aria-hidden="true" />
                  <CraneContainer />
                </div>
              </div>
            </div>
          </div>
          <footer>
            <div className="logo">
              <img className="brand-logo-image" src={LOGO_SRC} alt="" />
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
