import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronUp, Instagram, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motionBlocked, useMotionOverlay } from "./motionActivity";
import { navigateToSection } from "./sectionNavigation";
import { bookingUrl, instagramUrl, nav } from "./content";

const FooterAtmosphere = lazy(() => import("./CinematicAtmosphere"));

function FooterRibbons({ panel = false }: { panel?: boolean }) {
  return (
    <div className={panel ? "crossed-ribbons panel-ribbons" : "crossed-ribbons"} aria-hidden="true">
      {[0, 1].map((row) => (
        <div className={`ribbon ribbon-${row}`} key={row}>
          <div className="ribbon-track">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>
                REALISMO <b>•</b> ORIENTAL <b>•</b> BLACKWORK <b>•</b> ANDRÉ MENDES <b>•</b>{" "}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CinematicFooter() {
  const root = useRef<HTMLElement>(null);
  const destination = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  useMotionOverlay(open);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      el.dataset["visible"] = String(!!entry?.isIntersecting);
    });
    observer.observe(el);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let speed = 1;
    let previous = performance.now();
    let scrollY = window.scrollY;
    const tracks = Array.from(el.querySelectorAll<HTMLElement>(".ribbon-track"));
    const animate = (now: number) => {
      if (document.hidden || motionBlocked() || el.dataset["visible"] !== "true") {
        frame = 0;
        speed = 1;
        return;
      }
      speed = 1 + (speed - 1) * Math.exp(-(now - previous) / 650);
      previous = now;
      tracks.forEach((track) =>
        track.getAnimations().forEach((animation) => {
          animation.playbackRate = speed;
        }),
      );
      if (speed > 1.01) frame = requestAnimationFrame(animate);
      else frame = 0;
    };
    const accelerate = () => {
      const delta = window.scrollY - scrollY;
      scrollY = window.scrollY;
      if (
        document.hidden ||
        motionBlocked() ||
        motion.matches ||
        el.dataset["visible"] !== "true" ||
        delta <= 0
      )
        return;
      speed = Math.min(6, speed + delta / 90);
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    window.addEventListener("scroll", accelerate, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", accelerate);
    };
  }, []);
  return (
    <footer ref={root} className="cinematic-footer">
      <FooterRibbons />
      <div className="footer-invitation">
        <span className="eyebrow">A PRÓXIMA HISTÓRIA PODE SER A SUA.</span>
        <h2>
          DA SUA IDEIA.
          <br />
          <em>PARA A SUA PELE.</em>
        </h2>
        <a className="cta" href={bookingUrl} target="_blank" rel="noreferrer">
          Vamos conversar <ArrowUpRight size={22} />
        </a>
        <a className="footer-instagram" href={instagramUrl} target="_blank" rel="noreferrer">
          <Instagram size={22} />
          @andremndes
        </a>
      </div>
      <div className="footer-lettering" aria-hidden="true">
        <img src="/art/andre-lettering.webp" alt="" width="1100" height="453" />
        <img src="/art/mendes-lettering.webp" alt="" width="1100" height="412" />
      </div>
      <div className="footer-bar">
        <a className="footer-brand" href="#inicio">
          <img src="/art/am-logo.webp" width="110" height="75" alt="AM — início" />
        </a>
        <span>© {new Date().getFullYear()} ANDRÉ MENDES</span>
        <a href="#inicio" className="footer-back">
          AO TOPO <ChevronUp size={16} />
        </a>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="footer-expand" aria-label="Expandir rodapé" aria-expanded={open}>
              MAIS <Plus size={22} />
            </button>
          </DialogTrigger>
          <DialogContent
            className="footer-panel"
            onCloseAutoFocus={(event) => {
              const href = destination.current;
              if (!href) return;
              event.preventDefault();
              destination.current = null;
              navigateToSection(href);
            }}
          >
            <div className="footer-panel-atmosphere" aria-hidden="true">
              <Suspense fallback={null}>
                <FooterAtmosphere intensity={1.6} overlay />
              </Suspense>
            </div>
            <FooterRibbons panel />
            <DialogTitle>Explore o universo André Mendes</DialogTitle>
            <DialogDescription>
              Navegação, trabalhos reais e contato direto com o artista.
            </DialogDescription>
            <div className="footer-panel-links">
              <div>
                <span>EXPLORE</span>
                {nav.map(([label, href]) => (
                  <a
                    href={href}
                    key={href}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      destination.current = href || null;
                      setOpen(false);
                    }}
                  >
                    {label}
                    <ArrowUpRight size={22} />
                  </a>
                ))}
              </div>
              <div>
                <span>ENCONTRE ANDRÉ</span>
                <a href={instagramUrl} target="_blank" rel="noreferrer">
                  Instagram <ArrowUpRight size={22} />
                </a>
                <a href={bookingUrl} target="_blank" rel="noreferrer">
                  WhatsApp <ArrowUpRight size={22} />
                </a>
                <p>São José dos Campos — SP</p>
              </div>
              <div>
                <span>SUA PRÓXIMA ARTE</span>
                <p>
                  Realismo, oriental e blackwork.
                  <br />
                  Envie sua ideia e suas referências.
                </p>
                <a href={bookingUrl} target="_blank" rel="noreferrer">
                  Conversar sobre um projeto <ArrowUpRight size={22} />
                </a>
              </div>
            </div>
            <div className="footer-panel-identity">
              <img
                className="footer-panel-logo"
                src="/art/am-logo.webp"
                alt="AM"
                width="420"
                height="286"
              />
              <p className="footer-panel-name">ANDRÉ MENDES</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
}
