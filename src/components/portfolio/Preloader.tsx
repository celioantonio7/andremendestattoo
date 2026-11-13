import { useEffect, useRef, useState } from "react";
import type { gsap as GsapType } from "gsap";
import { art } from "./content";

const photos = [art[0]!, art[1]!, art[3]!, art[4]!, art[5]!, art[7]!];
const criticalAssets = [
  "/art/am-logo.webp",
  "/art/andre-cutout.webp?v=5",
  "/art/andre-lettering.webp",
  "/art/mendes-lettering.webp",
  ...art.map((photo) => photo.src),
  "/art/lion.webp",
  "/art/realism-artist-reference.webp",
  "/art/dragon.webp",
  "/art/mandala.webp",
  "/art/hannya.webp",
  "/art/machine.webp",
  "/art/process-workbench.webp",
  "/art/styles-floor.webp",
  "/art/sculpture.webp",
  "/works/detail-1.webp",
  "/works/detail-2.webp",
  "/works/detail-3.webp",
  "/works/detail-mask.webp",
  "/works/style-blackwork.webp",
];

export function Preloader({ onReady }: { onReady: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let disposed = false,
      loaded = false,
      sequenceDone = false,
      exiting = false,
      settled = 0;
    let context: ReturnType<typeof GsapType.context> | undefined;
    let sequence: ReturnType<typeof GsapType.timeline> | undefined;
    let exit: ReturnType<typeof GsapType.timeline> | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maybeExit = () => {
      if (disposed || exiting || !loaded || !sequenceDone) return;
      exiting = true;
      if (reduce) {
        onReady();
        return;
      }
      void import("gsap")
        .then(({ gsap }) => {
          if (disposed) return;
          const logo = root.current?.querySelector<HTMLImageElement>(".preloader-final-logo img");
          const target = document.querySelector<HTMLImageElement>(".site-header .brand img");
          if (!logo || !target) {
            onReady();
            return;
          }
          const from = logo.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          root.current?.setAttribute("data-docking", "true");
          exit = gsap
            .timeline({ onComplete: onReady })
            .to(
              ".preloader-counter,.preloader-track,.preloader-caption,.preloader-top,.preloader-final-logo > span",
              { opacity: 0, duration: 0.25 },
              0,
            )
            .to(
              logo,
              {
                x: to.left + to.width / 2 - from.left - from.width / 2,
                y: to.top + to.height / 2 - from.top - from.height / 2,
                scale: Math.min(to.width / from.width, to.height / from.height),
                transformOrigin: "center",
                duration: 1,
                ease: "power3.inOut",
              },
              0.15,
            )
            .to(root.current, { opacity: 0, duration: 0.25 }, 1.05);
        })
        .catch(() => {
          if (!disposed) onReady();
        });
    };
    const available = () => {
      if (disposed || loaded) return;
      settled++;
      setProgress(Math.round((settled / (criticalAssets.length + 2)) * 100));
      if (settled >= criticalAssets.length + 2) {
        loaded = true;
        maybeExit();
      }
    };
    const images = criticalAssets.map((src) => {
      const image = new Image();
      image.onload = available;
      image.onerror = available;
      image.src = src;
      return image;
    });
    void Promise.allSettled([
      document.fonts.load('500 16px "Manrope"'),
      document.fonts.load('400 32px "Flamenco"', "ANDRÉ PRECISÃO À SUA PELE"),
      document.fonts.load('600 32px "Clash Display"', "PORTFÓLIO"),
      document.fonts.load('700 32px "Clash Display"'),
      document.fonts.load('italic 500 24px "Cormorant Garamond"'),
      document.fonts.load('700 38px "Teko"', "01"),
    ])
      .then(() => document.fonts.ready)
      .then(available);
    void Promise.allSettled([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("three"),
      import("./CinematicAtmosphere"),
    ]).then(available);
    const timeout = setTimeout(() => {
      loaded = true;
      if (!disposed) setProgress(100);
      maybeExit();
    }, 4500);
    // The failsafe also covers a blocked animation chunk; the site must remain reachable.
    const fallback = setTimeout(() => {
      if (!disposed) onReady();
    }, 6500);
    if (reduce) {
      sequenceDone = true;
      maybeExit();
    } else
      void import("gsap")
        .then(({ gsap }) => {
          if (disposed || !root.current) return;
          context = gsap.context(() => {
            sequence = gsap.timeline({ defaults: { ease: "expo.inOut" } });
            const panels = gsap.utils.toArray<HTMLElement>(".preloader-photo");
            panels.forEach((panel, i) => {
              sequence!
                .fromTo(
                  panel,
                  { clipPath: "inset(50% 50% 50% 50%)" },
                  { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 },
                  i * 0.32,
                )
                .fromTo(
                  panel.querySelector("img"),
                  { scale: 1.65 },
                  { scale: 1, duration: 0.95 },
                  i * 0.32,
                );
            });
            sequence
              .to(
                ".preloader-photo-stack",
                { yPercent: -8, scale: 0.88, opacity: 0, duration: 0.55 },
                2.65,
              )
              .fromTo(
                ".preloader-final-logo",
                { opacity: 0, scale: 0.92 },
                { opacity: 1, scale: 1, duration: 0.6 },
                2.9,
              )
              .to(".preloader-caption", { opacity: 0.5, duration: 0.3 }, 2.9)
              .call(
                () => {
                  sequenceDone = true;
                  maybeExit();
                },
                [],
                3.5,
              );
          }, root);
        })
        .catch(() => {
          sequenceDone = true;
          maybeExit();
        });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      clearTimeout(fallback);
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
      exit?.kill();
      sequence?.kill();
      context?.revert();
    };
  }, [onReady]);
  const digits = String(Math.min(progress, 100)).padStart(3, "0");
  return (
    <div
      ref={root}
      className="preloader photo-preloader"
      role="status"
      aria-label="Carregando a experiência André Mendes"
    >
      <div className="preloader-top">
        <span>ANDRÉ MENDES</span>
        <span>TATUADOR ARTÍSTICO</span>
      </div>
      <div className="preloader-photo-stack" aria-hidden="true">
        {photos.map((photo) => (
          <div className="preloader-photo" key={photo.src}>
            <img src={photo.src} alt="" width="640" height="850" />
          </div>
        ))}
      </div>
      <div className="preloader-final-logo">
        <img src="/art/am-logo.webp" alt="AM" width="420" height="286" />
        <span>ANDRÉ MENDES</span>
      </div>
      <div className="preloader-counter" aria-hidden="true">
        {digits.split("").map((digit, i) => (
          <span className="digit-window" key={i}>
            <span
              className="digit-column"
              style={{ transform: `translateY(-${Number(digit) * 10}%)` }}
            >
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
        <small>/ 100</small>
      </div>
      <div
        className="preloader-track"
        role="progressbar"
        aria-label="Recursos da página"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <span className="preloader-caption">HISTÓRIAS REAIS. ARTE NA PELE.</span>
    </div>
  );
}
