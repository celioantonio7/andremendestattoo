import { seoMeta, siteUrl, structuredData } from "@/lib/seo";
import { SurfaceSmoke } from "@/components/portfolio/SurfaceSmoke";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Pencil,
  PenTool,
  ShieldCheck,
  Brush,
  X,
} from "lucide-react";
import { bookingUrl, instagramUrl, nav } from "@/components/portfolio/content";
import { ArtworkCarousel, Magnetic } from "@/components/portfolio/Interactive";
import { MenuTransition } from "@/components/portfolio/MenuTransition";
import { navigateToSection } from "@/components/portfolio/sectionNavigation";
import { useSectionActivity } from "@/components/portfolio/motionActivity";
import { MobileNavigation } from "@/components/portfolio/MobileNavigation";
import { FloatingWhatsApp } from "@/components/portfolio/FloatingControls";
import { useHeaderVisibility } from "@/components/portfolio/useHeaderVisibility";
import { CinematicFooter } from "@/components/portfolio/CinematicFooter";
import { DiveSequence } from "@/components/portfolio/DiveSequence";
import { ReelShowcase } from "@/components/portfolio/ReelShowcase";
import { StyleCard } from "@/components/portfolio/StyleCard";
import { BrandIcon } from "@/components/portfolio/BrandIcon";
import { PortfolioFAQ } from "@/components/portfolio/PortfolioFAQ";
import { FrameAccents } from "@/components/portfolio/FrameAccents";
import { Preloader } from "@/components/portfolio/Preloader";
import { useCardInteractions } from "@/components/portfolio/useCardInteractions";
import { usePortfolioMotion } from "@/components/portfolio/usePortfolioMotion";

const Atmosphere = lazy(() => import("@/components/portfolio/CinematicAtmosphere"));

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      ...(siteUrl ? [{ rel: "canonical", href: `${siteUrl}/` }] : []),
      { rel: "preload", as: "image", href: "/art/andre-cutout.webp?v=5", fetchPriority: "high" },
      { rel: "preload", as: "image", href: "/art/am-logo.webp" },
    ],
    meta: seoMeta,
    scripts: [{ type: "application/ld+json", children: JSON.stringify(structuredData) }],
  }),
  component: Index,
});

const stories = [
  {
    number: "01",
    art: "/art/sculpture.webp",
    title: "Tatuagem como",
    emphasis: "identidade.",
    text: "Precisão, conceito e presença em cada traço.",
    detail: "Uma ideia ganha forma quando encontra a sua própria linguagem.",
  },
  {
    number: "02",
    art: "/art/lion.webp",
    title: "Contraste que",
    emphasis: "impressiona.",
    text: "Luz e sombra. Força e delicadeza.",
    detail:
      "Realismo, oriental e blackwork. Diferentes técnicas, a mesma essência: arte que carrega história.",
  },
  {
    number: "03",
    art: "/art/dragon.webp",
    title: "Da ideia à",
    emphasis: "sua pele.",
    text: "Cada projeto começa com uma conversa.",
    detail: "Suas referências, sua intenção e uma composição pensada para você.",
  },
  {
    number: "04",
    art: "/art/mandala.webp",
    title: "Precisão em",
    emphasis: "cada detalhe.",
    text: "Uma composição que acompanha as formas do corpo.",
    detail: "Posição, proporção e contraste fazem parte da criação, do primeiro desenho à sessão.",
  },
  {
    number: "05",
    art: "/art/machine.webp",
    title: "Arte que",
    emphasis: "permanece.",
    text: "Sua história continua depois da sessão.",
    detail:
      "Orientações de cuidado para acompanhar cada etapa da cicatrização e preservar os detalhes.",
  },
];
const styles = [
  {
    name: "Realismo",
    src: "/art/realism-artist-reference.webp",
    text: "Detalhes, expressão e profundidade que impressionam.",
    detail:
      "Retratos, animais e composições com luz e sombra. O projeto parte das suas referências para construir volume, textura e uma leitura que acompanha o corpo.",
  },
  {
    name: "Oriental",
    src: "/works/detail-mask.webp",
    text: "Cultura, tradição e simbolismo em traços marcantes.",
    detail:
      "Máscaras, dragões e elementos inspirados na arte oriental. Cada composição combina movimento, contraste e símbolos escolhidos em conjunto com você.",
  },
  {
    name: "Blackwork",
    src: "/works/style-blackwork.webp",
    text: "Contraste, força e formas que se destacam.",
    detail:
      "Preto sólido, espaços de pele e linhas que definem o desenho. Uma linguagem de contraste para composições ornamentais, geométricas e autorais.",
  },
];
function TattooMachine({ size = 30, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m13 30 15-16 9 9-15 16-9-9Zm14-17 5-5 10 10-5 5M31 8l3-3 11 11-3 3M13 31l-4 4 5 5 4-4M10 36l-5 7M20 22l-6-6 5-5 6 6M16 14l-5-4 4-4 5 5" />
    </svg>
  );
}
function HandCare({ size = 30, strokeWidth = 1.5 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M26 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11ZM4 33l9-8 10 2c5 1 6 6 0 6h-6m5 0 13-8c5-3 8 2 4 5L25 42H12l-8-9Z" />
    </svg>
  );
}
const steps = [
  {
    name: "Agendamento",
    icon: CalendarDays,
    text: "Entre em contato, tire suas dúvidas e escolha a melhor data e horário.",
  },
  {
    name: "Conceito",
    icon: Pencil,
    text: "Alinhamos a ideia, referências e estilo para criar um projeto exclusivo para você.",
  },
  {
    name: "Sessão",
    icon: TattooMachine,
    text: "Execução com técnica, segurança, higiene e total atenção aos detalhes.",
  },
  {
    name: "Cuidados",
    icon: HandCare,
    text: "Orientações completas para uma cicatrização perfeita e duradoura.",
  },
];

function SectionBackdrop({ left, right }: { left: string; right: string }) {
  return (
    <div className="section-backdrop" aria-hidden="true">
      <img className="backdrop-left" src={left} alt="" width="512" height="512" loading="lazy" />
      <img className="backdrop-right" src={right} alt="" width="512" height="512" loading="lazy" />
    </div>
  );
}

function SectionMeta({ label }: { label: string }) {
  return (
    <div className="section-meta">
      <span>
        ANDRÉ MENDES <i />
      </span>
      <span>{label}</span>
    </div>
  );
}
function Energy({
  className = "",
  path = "M0 150 C250 180 350 5 650 70 S1000 200 1400 30",
}: {
  className?: string;
  path?: string;
}) {
  return (
    <svg
      className={`section-energy ${className}`}
      viewBox="0 0 1400 220"
      fill="none"
      aria-hidden="true"
    >
      <path className="energy-track" d={path} />
      <path className="energy-path" d={path} />
    </svg>
  );
}

function Index() {
  const root = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const finishPreload = useCallback(() => setSceneReady(true), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [brief, setBrief] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [canvasMounted, setCanvasMounted] = useState(false);
  usePortfolioMotion(root, sceneReady);
  useCardInteractions(root);
  useSectionActivity(root, sceneReady);
  useHeaderVisibility(root, menuOpen);
  useEffect(() => {
    setCanvasMounted(true);
    const visibility = () => {
      if (root.current) root.current.dataset["hidden"] = String(document.hidden);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -50% 0px" },
    );
    root.current
      ?.querySelectorAll("main > section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="portfolio-site">
      {!sceneReady && <Preloader onReady={finishPreload} />}
      <FloatingWhatsApp />
      <MenuTransition />
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <div className="cinematic-atmosphere" aria-hidden="true">
        {canvasMounted && sceneReady && (
          <Suspense fallback={null}>
            <Atmosphere />
          </Suspense>
        )}
        <div className="atmosphere-vignette" />
        <div className="film-grain" />
      </div>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="André Mendes — início">
          <img src="/art/am-logo.webp" width="180" height="110" alt="AM" />
        </a>
        <nav aria-label="Navegação principal" className="main-nav" id="main-navigation">
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={activeSection === href?.slice(1) ? "active" : ""}
              aria-current={activeSection === href?.slice(1) ? "location" : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                setMenuOpen(false);
                if (href) navigateToSection(href);
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <a className="header-booking" href="#contato">
          <CalendarDays size={17} />
          <span>Agendar tattoo</span>
          <ArrowRight size={19} />
        </a>
        <MobileNavigation open={menuOpen} onOpenChange={setMenuOpen} />
      </header>

      <main id="main">
        <noscript>
          <style>{`.embla-viewport{overflow-x:auto!important;touch-action:auto}.carousel-controls,.brief-copy,.preloader{display:none!important}`}</style>
          <p className="no-script-note">
            Explore a galeria arrastando a barra horizontal. As animações e a ampliação interativa
            precisam de JavaScript.
          </p>
        </noscript>
        <section id="inicio" className="hero-section" aria-labelledby="hero-title">
          <SectionBackdrop left="/art/sculpture.webp" right="/art/hannya.webp" />
          <SurfaceSmoke />
          <div className="hero-halo" aria-hidden="true">
            <div className="halo-depth">
              <div className="halo-aura" />
              <svg className="halo-orbit halo-orbit-outer" viewBox="0 0 600 600">
                <defs>
                  <linearGradient id="halo-light">
                    <stop stopColor="#ffb65b" />
                    <stop offset=".55" stopColor="#ed493b" />
                    <stop offset="1" stopColor="#84dce9" />
                  </linearGradient>
                </defs>
                <circle cx="300" cy="300" r="288" pathLength="100" />
              </svg>
              <svg className="halo-orbit halo-orbit-inner" viewBox="0 0 600 600">
                <circle cx="300" cy="300" r="270" pathLength="100" />
              </svg>
              <span className="halo-glint halo-glint-one" />
              <span className="halo-glint halo-glint-two" />
            </div>
          </div>
          <div className="hero-topline">
            <span className="tiny-label">TATUADOR ARTÍSTICO</span>
            <span className="hero-edition">ARTE / TÉCNICA / IDENTIDADE</span>
          </div>
          <ArtworkCarousel hero />
          <div className="hero-socials" aria-label="Redes e trabalhos">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de André Mendes"
            >
              <BrandIcon brand="instagram" size={18} />
            </a>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Conversar pelo WhatsApp"
            >
              <BrandIcon brand="whatsapp" size={18} />
            </a>
            <a href="#trabalhos-em-movimento" aria-label="Assistir aos trabalhos">
              <BrandIcon brand="youtube" size={18} />
            </a>
          </div>
          <svg
            className="hero-energy"
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-100 620 C150 380 400 460 680 270 S1200 50 1700 250" />
            <path d="M-80 820 C480 1030 1170 500 1690 680" />
          </svg>
          <div className="hero-portrait">
            <div className="hero-portrait-inner">
              <img
                src="/art/andre-cutout.webp?v=5"
                alt="André Mendes, tatuador artístico"
                width="1122"
                height="1186"
                fetchPriority="high"
              />
            </div>
          </div>
          <h1 id="hero-title" className="hero-name">
            <span className="sr-only">André Mendes</span>
            <span className="name-andre" aria-hidden="true">
              <img src="/art/andre-lettering.webp" alt="" width="850" height="370" />
            </span>
            <span className="name-mendes" aria-hidden="true">
              <img src="/art/mendes-lettering.webp" alt="" width="850" height="370" />
            </span>
          </h1>
          <div className="hero-bottom">
            <Magnetic href="#portfolio">Ver trabalhos</Magnetic>
            <p className="hero-specialties">
              REALISMO <b>/</b> BLACKWORK <b>/</b> ORIENTAL
            </p>
          </div>
          <a href="#sobre" className="scroll-cue" aria-label="Conhecer André">
            <span>CONTINUE A EXPERIÊNCIA</span>
            <ArrowDown size={16} />
          </a>
        </section>

        <section id="sobre" className="about-section section-shell" aria-labelledby="about-title">
          <SectionBackdrop left="/art/sculpture.webp" right="/art/mandala.webp" />
          <FrameAccents tone="red" />
          <SectionMeta label="SOBRE / ESSÊNCIA" />
          <div className="about-layout">
            <div className="about-sticky">
              <div className="about-heading" data-reveal="mask">
                <span className="eyebrow">SOBRE O ARTISTA</span>
                <h2 id="about-title">
                  ANDRÉ
                  <br />
                  <em>MENDES</em>
                </h2>
              </div>
              <div className="sculpture-wrap">
                <img
                  className="sculpture-art"
                  src="/art/sculpture.webp"
                  alt="Composição artística de escultura clássica e rosa"
                  width="680"
                  height="850"
                  loading="lazy"
                />
                <div className="sculpture-halo" aria-hidden="true" />
              </div>
              <span className="about-signature">A ARTE É A NOSSA LINGUAGEM.</span>
            </div>
            <div className="story-stack">
              {stories.map((story, i) => (
                <article className={`story-card story-card-${i}`} key={story.number}>
                  <div className="story-inner">
                    <SurfaceSmoke />
                    <span
                      className="story-art"
                      aria-hidden="true"
                      style={{
                        backgroundImage: `linear-gradient(90deg, #070709ee 8%, #07070985 65%, #07070944), url("${story.art}")`,
                      }}
                    />
                    <span className="story-border-light" aria-hidden="true" />
                    <span className="story-number">
                      {story.number} <i />
                    </span>
                    <h3>
                      {story.title}
                      <br />
                      <em>
                        {story.emphasis}
                        <svg className="story-underline" viewBox="0 0 320 24" aria-hidden="true">
                          <path pathLength="1" d="M5 19 Q145 -1 311 10 M55 22 Q175 8 290 15" />
                        </svg>
                      </em>
                    </h3>
                    <p className="story-lead">{story.text}</p>
                    <p className="progressive-text">
                      {story.detail.split(" ").map((word, index) => (
                        <span className="reveal-word" key={index}>
                          {word}{" "}
                        </span>
                      ))}
                    </p>
                    <span className="story-mark" aria-hidden="true">
                      ///
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <Energy />
        </section>

        <section
          id="estilos"
          className="styles-section section-shell"
          aria-labelledby="styles-title"
        >
          <div className="styles-floor-scene" aria-hidden="true" />
          <FrameAccents tone="red" />
          <SectionMeta label="ESTILOS / TÉCNICA / IDENTIDADE" />
          <div className="editorial-heading">
            <h2 id="styles-title" data-reveal="mask">
              <span>ESTILOS DE</span>
              <em>TATUAGEM</em>
            </h2>
            <p data-reveal="right">
              Diferentes técnicas,
              <br />
              mesma essência:
              <br />
              arte que carrega história.
              <span className="small-rule" />
            </p>
            <span className="brush-decoration" aria-hidden="true">
              ///
            </span>
          </div>
          <div className="style-grid">
            {styles.map((style, i) => (
              <div
                className="style-entry"
                data-reveal={i === 0 ? "left" : i === 2 ? "right" : "up"}
                key={style.name}
              >
                <StyleCard style={style} index={i} />
              </div>
            ))}
          </div>
          <div className="section-footnote">
            <span>TRÊS LINGUAGENS. INFINITAS POSSIBILIDADES.</span>
            <span aria-hidden="true">///</span>
          </div>
        </section>

        <section id="duvidas" className="faq-section section-shell" aria-labelledby="faq-title">
          <FrameAccents tone="cyan" />
          <SectionMeta label="DÚVIDAS / ANTES DA SUA TATUAGEM" />
          <div className="editorial-heading">
            <h2 id="faq-title">
              <span>PERGUNTAS</span>
              <em>FREQUENTES</em>
            </h2>
            <p>
              Seu próximo passo,
              <br />
              com mais clareza.
              <span className="small-rule" />
            </p>
          </div>
          <PortfolioFAQ />
        </section>
        <section
          id="portfolio"
          className="gallery-section section-shell"
          aria-labelledby="gallery-title"
        >
          <FrameAccents tone="cyan" />
          <ReelShowcase />
          <DiveSequence />
          <Energy path="M0 30 C450 0 200 230 680 150 S1110 10 1400 170" />
        </section>

        <section
          id="processo"
          className="process-section section-shell"
          aria-labelledby="process-title"
        >
          <div className="process-workbench" aria-hidden="true" />
          <FrameAccents tone="red" />
          <img className="process-monogram" src="/art/am-logo.webp" alt="" aria-hidden="true" />
          <SectionMeta label="PROCESSO / DA IDEIA À PELE" />
          <div className="editorial-heading">
            <h2 id="process-title" data-reveal="mask">
              <span>DO CONCEITO À</span>
              <em>ARTE FINAL</em>
            </h2>
            <p data-reveal="right">
              Uma experiência pensada
              <br />
              em cada etapa.
              <span className="small-rule" />
            </p>
          </div>
          <div className="process-grid">
            <svg
              className="process-line"
              viewBox="0 0 1200 260"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="energy-track"
                d="M0 80 L180 80 L400 180 L640 80 L900 180 L1200 130"
              />
              <path className="energy-path" d="M0 80 L180 80 L400 180 L640 80 L900 180 L1200 130" />
            </svg>
            {steps.map((step, i) => (
              <article className={`process-card process-card-${i}`} key={step.name}>
                <div className="process-surface">
                  <SurfaceSmoke />
                  <div className="step-top">
                    <span>0{i + 1}</span>
                    <span className="step-icon-frame">
                      <svg
                        className="icon-brackets"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M0 17 V7 L7 0 H17 M47 0 H57 L64 7 V17 M64 47 V57 L57 64 H47 M17 64 H7 L0 57 V47" />
                      </svg>
                      <step.icon size={42} strokeWidth={1.5} />
                    </span>
                  </div>
                  <h3>{step.name}</h3>
                  <span className="small-rule" />
                  <p>{step.text}</p>
                  <span className="step-coordinate" aria-hidden="true">
                    <ArrowRight size={25} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contato"
          className="contact-section section-shell"
          aria-labelledby="contact-title"
        >
          <SectionBackdrop left="/works/work-7.webp" right="/art/machine.webp" />
          <FrameAccents tone="gold" />
          <SectionMeta label="CONTATO / AGENDAMENTO" />
          <div className="contact-layout">
            <div className="contact-copy">
              <span className="eyebrow" data-reveal="up">
                O PRÓXIMO TRAÇO COMEÇA AQUI.
              </span>
              <h2 id="contact-title" data-reveal="mask">
                <span>CONTATO E</span>
                <em>AGENDAMENTO</em>
              </h2>
              <p className="contact-question" data-reveal="up">
                VAMOS CRIAR
                <br />
                <strong>
                  ALGO <em>ÚNICO?</em>
                </strong>
              </p>
              <Magnetic href={bookingUrl || "#briefing"}>
                <CalendarDays size={22} />
                {bookingUrl ? "Agendar sessão" : "Preparar minha ideia"}
              </Magnetic>
              <div id="briefing" className="briefing" data-reveal="up">
                <label htmlFor="tattoo-idea">Conte sua ideia</label>
                <p>Estilo, região do corpo, tamanho e referências.</p>
                <textarea
                  id="tattoo-idea"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Quero transformar em tatuagem…"
                  rows={3}
                />
                <button
                  className="brief-copy"
                  disabled={!brief.trim()}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(brief);
                      setCopyStatus("Ideia copiada. Guarde para conversar com o artista.");
                    } catch {
                      setCopyStatus("Selecione o texto acima e copie sua ideia.");
                    }
                  }}
                >
                  {copyStatus.startsWith("Ideia copiada") ? (
                    <Check size={17} />
                  ) : (
                    <Copy size={17} />
                  )}
                  Copiar briefing
                  <ArrowRight size={17} />
                </button>
                <p className="booking-note">
                  {bookingUrl
                    ? "Envie sua ideia pelo canal de agendamento."
                    : "Canal direto de agendamento em configuração."}
                </p>
                <p role="status" className="copy-status">
                  {copyStatus}
                </p>
              </div>
            </div>
            <div className="contact-art" aria-hidden="true">
              <div className="contact-orbit" />
              <div data-parallax="45">
                <img src="/art/machine.webp" alt="" loading="lazy" width="680" height="850" />
              </div>
              <span className="floating-coordinate">
                PRECISÃO
                <br />
                EM CADA TRAÇO.
              </span>
            </div>
          </div>
          <Energy path="M0 160 C450 150 450 50 850 120 S1200 220 1400 20" />
        </section>
      </main>
      <CinematicFooter />
    </div>
  );
}
