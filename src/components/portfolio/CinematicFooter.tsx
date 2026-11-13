import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronUp, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import "@/footer-motion.css";
import { activityEvent, motionBlocked, useMotionOverlay } from "./motionActivity";
import { navigateToSection } from "./sectionNavigation";
import { bookingUrl, instagramUrl, nav } from "./content";
import { BrandIcon } from "./BrandIcon";

const FooterAtmosphere = lazy(() => import("./CinematicAtmosphere"));

function FooterRibbons({ panel = false }: { panel?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const tracks = Array.from(el.querySelectorAll<HTMLElement>(".ribbon-track"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const initialRect = el.getBoundingClientRect();
    let inView = initialRect.bottom >= -150 && initialRect.top <= innerHeight + 150;
    let speed = 1;
    let frame = 0;
    let previous = 0;
    let previousScroll = scrollY;
    const entries: { animation: Animation; distance: number; duration: number }[] = [];
    const sync = () => {
      const playing = inView && !document.hidden && !motion.matches && (panel || !motionBlocked());
      el.dataset["running"] = String(playing);
      if (!playing) {
        cancelAnimationFrame(frame);
        frame = 0;
        speed = 1;
        entries.forEach(({ animation }) => animation.updatePlaybackRate(1));
      }
      entries.forEach(({ animation }) => (playing ? animation.play() : animation.pause()));
    };
    const measure = () => {
      tracks.forEach((track, row) => {
        const group = track.firstElementChild;
        const distance = group ? parseFloat(getComputedStyle(group).width) : 0;
        if (!distance) return;
        const old = entries[row];
        if (old && Math.abs(old.distance - distance) < 0.5) return;
        const phasePixels = old
          ? (((Number(old.animation.currentTime) || 0) % old.duration) / old.duration) *
            old.distance
          : 0;
        old?.animation.cancel();
        const duration = (distance / 55) * 1000;
        const animation = track.animate(
          [{ transform: "translateX(0)" }, { transform: `translateX(-${distance}px)` }],
          {
            duration,
            iterations: Infinity,
            direction: row ? "reverse" : "normal",
            easing: "linear",
          },
        );
        const visualOffset = old && row ? old.distance - phasePixels : phasePixels;
        const nextPhase = old && row ? distance - visualOffset : phasePixels;
        animation.currentTime =
          ((((nextPhase % distance) + distance) % distance) / distance) * duration;
        animation.playbackRate = speed;
        entries[row] = { animation, distance, duration };
      });
      sync();
    };
    const decay = (now: number) => {
      speed = 1 + (speed - 1) * Math.exp(-(now - previous) / 650);
      previous = now;
      entries.forEach(({ animation }) => animation.updatePlaybackRate(speed));
      if (speed > 1.01) frame = requestAnimationFrame(decay);
      else {
        speed = 1;
        entries.forEach(({ animation }) => animation.updatePlaybackRate(1));
        frame = 0;
      }
    };
    const accelerate = () => {
      const delta = scrollY - previousScroll;
      previousScroll = scrollY;
      if (!inView || motion.matches || document.hidden || (!panel && motionBlocked()) || delta <= 0)
        return;
      speed = Math.min(5, speed + delta / 100);
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(decay);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = !!entry?.isIntersecting;
        sync();
      },
      { rootMargin: "150px 0px" },
    );
    const resize = new ResizeObserver(measure);
    tracks.forEach((track) => {
      if (track.firstElementChild) resize.observe(track.firstElementChild);
    });
    measure();
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener(activityEvent, sync);
    window.addEventListener("scroll", accelerate, { passive: true });
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      entries.forEach(({ animation }) => animation.cancel());
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener(activityEvent, sync);
      window.removeEventListener("scroll", accelerate);
      motion.removeEventListener("change", sync);
    };
  }, [panel]);
  return (
    <div
      ref={root}
      className={`crossed-ribbons footer-live-ribbons${panel ? " panel-ribbons" : ""}`}
      aria-hidden="true"
    >
      {[0, 1].map((row) => (
        <div className={`ribbon ribbon-${row}`} key={row}>
          <div className="ribbon-track">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
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
  return (
    <footer ref={root} className="cinematic-footer">
      <FooterRibbons />
      <div className="footer-invitation">
        <span className="eyebrow">A PRÓXIMA HISTÓRIA PODE SER A SUA.</span>
        <h2>
          DA SUA <span className="footer-red-word">IDEIA.</span>
          <br />
          <em>
            PARA A SUA <span className="footer-red-word">PELE.</span>
          </em>
        </h2>
        <a className="cta" href={bookingUrl} target="_blank" rel="noreferrer">
          Vamos conversar <ArrowUpRight size={22} />
        </a>
        <a className="footer-instagram" href={instagramUrl} target="_blank" rel="noreferrer">
          <BrandIcon brand="instagram" size={22} />
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
