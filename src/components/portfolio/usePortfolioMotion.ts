import { useEffect, type RefObject } from "react";
import { motionBlocked } from "./motionActivity";

export function usePortfolioMotion(root: RefObject<HTMLDivElement | null>, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        const ctx = gsap.context(() => {
          media.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.fromTo(
              ".ink-seam-fill",
              { attr: { d: "M0 45 C360 100 1080 0 1440 55 L1440 110 L0 110 Z" } },
              {
                attr: { d: "M0 65 C360 0 1080 110 1440 35 L1440 110 L0 110 Z" },
                ease: "none",
                scrollTrigger: {
                  trigger: ".ink-seam",
                  start: "top bottom",
                  end: "bottom 20%",
                  scrub: 0.7,
                },
              },
            );
            gsap.fromTo(
              ".ink-seam-edge",
              { attr: { d: "M0 45 C360 100 1080 0 1440 55" } },
              {
                attr: { d: "M0 65 C360 0 1080 110 1440 35" },
                ease: "none",
                scrollTrigger: {
                  trigger: ".ink-seam",
                  start: "top bottom",
                  end: "bottom 20%",
                  scrub: 0.7,
                },
              },
            );
            const opening = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
            opening
              .from(".hero-energy", { opacity: 0, scaleX: 0.3, duration: 1.2 }, 0.2)
              .from(
                ".hero-portrait",
                { clipPath: "inset(100% 0% 0% 0%)", y: 35, opacity: 0, duration: 1.2 },
                0.4,
              )
              .from(".name-andre", { clipPath: "inset(0% 100% 0% 0%)", x: -35 }, 0.8)
              .from(".name-mendes", { clipPath: "inset(0% 0% 0% 100%)", x: 35 }, 1)
              .from(".hero-carousel .card-reveal", { y: 45, opacity: 0, stagger: 0.08 }, 1.15)
              .from(".hero-bottom", { y: 16, opacity: 0, stagger: 0.08, duration: 0.7 }, 1.4);
            gsap.from(".sculpture-art", {
              clipPath: "inset(0% 100% 0% 0%)",
              scale: 1.08,
              duration: 1.25,
              ease: "power3.out",
              scrollTrigger: { trigger: ".about-sticky", start: "top 85%", once: true },
            });
            gsap.fromTo(
              ".gallery-stage",
              { clipPath: "inset(18% 45% 18% 45% round 80px)", scale: 0.93 },
              {
                clipPath: "inset(0% 0% 0% 0% round 0px)",
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: ".gallery-stage",
                  start: "top 95%",
                  end: "top 25%",
                  scrub: 0.65,
                },
              },
            );
            gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
              if (el.classList.contains("style-entry")) {
                gsap.fromTo(
                  el,
                  {
                    rotationY: 18,
                    transformPerspective: 1200,
                    transformOrigin: "0% 50%",
                    clipPath: "inset(0 0% 0 0)",
                  },
                  {
                    rotationY: 0,
                    clipPath: "inset(0 0% 0 0)",
                    ease: "none",
                    scrollTrigger: { trigger: el, start: "top 95%", end: "top 72%", scrub: 0.65 },
                  },
                );
                return;
              }
              const section = el.closest("section")?.id;
              const mode = el.dataset["reveal"];
              const from =
                section === "contato"
                  ? { x: mode === "right" ? 90 : -90, clipPath: "inset(0 0 0 100%)" }
                  : section === "estilos"
                    ? { yPercent: 25, clipPath: "inset(100% 0 0 0)" }
                    : section === "portfolio"
                      ? { scale: 0.85, clipPath: "inset(0 50% 0 50%)" }
                      : { y: 35, clipPath: "inset(0 0 100% 0)" };
              gsap.fromTo(el, from, {
                x: 0,
                y: 0,
                yPercent: 0,
                scale: 1,
                clipPath: "inset(0 0 0% 0%)",
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 96%", end: "top 48%", scrub: 0.6 },
              });
            });
            // Each scene reveals its own artwork; only the scenery moves, never pinned ancestors.
            gsap.utils.toArray<HTMLElement>("main > section:not(#inicio)").forEach((section) => {
              const background = section.querySelector(".section-backdrop");
              if (!background) return;
              const states: Record<string, gsap.TweenVars> = {
                sobre: { clipPath: "polygon(0 0,0 0,0 100%,0 100%)" },
                estilos: { clipPath: "inset(0 0 100% 0)", scale: 1.12 },
                portfolio: { clipPath: "circle(5% at 50% 50%)", scale: 1.16 },
                processo: { clipPath: "inset(0 100% 0 0)" },
                contato: { clipPath: "inset(0 0 0 100%)", xPercent: 10 },
              };
              gsap.fromTo(background, states[section.id] || {}, {
                clipPath:
                  section.id === "sobre"
                    ? "polygon(0 0,100% 0,100% 100%,0 100%)"
                    : section.id === "portfolio"
                      ? "circle(75% at 50% 50%)"
                      : "inset(0 0% 0 0%)",
                xPercent: 0,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top 15%",
                  scrub: 0.7,
                },
              });
            });
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
              const distance = Number(el.dataset["parallax"]) || 35;
              gsap.fromTo(
                el,
                { y: distance },
                {
                  y: -distance,
                  ease: "none",
                  scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
                },
              );
            });
            gsap.utils.toArray<SVGPathElement>(".section-energy .energy-path").forEach((path) => {
              const length = path.getTotalLength();
              gsap.fromTo(
                path,
                { strokeDasharray: length, strokeDashoffset: length },
                {
                  strokeDashoffset: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: path.closest("section") || path,
                    start: "top 80%",
                    end: "bottom 65%",
                    scrub: 1.2,
                  },
                },
              );
            });
            gsap.utils.toArray<HTMLElement>(".progressive-text").forEach((text) => {
              gsap.from(text.querySelectorAll(".reveal-word"), {
                opacity: 0.15,
                y: 8,
                stagger: 0.045,
                duration: 0.5,
                scrollTrigger: { trigger: text, start: "top 88%", end: "top 35%", scrub: 0.6 },
              });
            });
            gsap.fromTo(
              ".contact-art img",
              { rotation: -8, scale: 0.9 },
              {
                rotation: 0,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: "#contato",
                  start: "top bottom",
                  end: "center center",
                  scrub: 1,
                },
              },
            );
            const cards = gsap.utils.toArray<HTMLElement>(".process-card");
            const processPath = root.current?.querySelector<SVGPathElement>(
              ".process-line .energy-path",
            );
            if (processPath) {
              const length = processPath.getTotalLength();
              const grid = root.current?.querySelector<HTMLElement>(".process-grid");
              const compact = window.matchMedia("(max-width: 899px)");
              const process = gsap.timeline({
                scrollTrigger: {
                  id: "process-pin",
                  trigger: "#processo",
                  start: "top top",
                  end: () => `+=${cards.length * Math.max(460, window.innerHeight * 0.8)}`,
                  pin: true,
                  pinSpacing: true,
                  anticipatePin: 1,
                  scrub: 0.5,
                  invalidateOnRefresh: true,
                  refreshPriority: 1,
                },
              });
              process.fromTo(
                processPath,
                { strokeDasharray: length, strokeDashoffset: length },
                { strokeDashoffset: 0, duration: 4.2, ease: "none" },
                0,
              );
              cards.forEach((card, i) => {
                const at = i * 1.2;
                if (i > 0 && grid)
                  process.to(
                    grid,
                    {
                      x: () => (compact.matches ? -(card.offsetLeft - cards[0]!.offsetLeft) : 0),
                      duration: 0.4,
                      ease: "power2.inOut",
                    },
                    at - 0.4,
                  );
                process
                  .fromTo(
                    card,
                    { autoAlpha: 0, y: 65 },
                    { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
                    at,
                  )
                  .from(card.querySelector(".step-top"), { opacity: 0, y: 12, duration: 0.25 }, at)
                  .from(
                    card.querySelectorAll("h3,p,.small-rule"),
                    { opacity: 0, y: 8, duration: 0.25, stagger: 0.04 },
                    at + 0.1,
                  )
                  .to(
                    card.querySelector(".process-surface"),
                    { borderColor: "#ffae32", duration: 0.3 },
                    at,
                  );
              });
              // Leave reading time after the final reveal before releasing the section.
              process.to({}, { duration: 0.7 });
            }
            const dive = gsap.timeline({
              scrollTrigger: {
                trigger: ".dive-sequence",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
              },
            });
            dive
              .to(".dive-layer-1 img", { scale: 1.04, duration: 1.6, ease: "none" }, 0)
              .fromTo(
                ".dive-layer-2",
                { clipPath: "inset(50% 50% 50% 50%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "none" },
                0.8,
              )
              .to(".dive-layer-2 img", { scale: 1.04, duration: 2, ease: "none" }, 0.8)
              .fromTo(
                ".dive-layer-3",
                { clipPath: "inset(50% 50% 50% 50%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" },
                2,
              )
              .fromTo(
                ".dive-layer-3 img",
                { scale: 1.05 },
                { scale: 1, duration: 2, ease: "none" },
                2,
              )
              .to(".dive-intro", { opacity: 0, duration: 0.35 }, 1.4)
              .fromTo(
                ".dive-copy",
                { opacity: 0, rotationY: -65, scale: 0.65 },
                { opacity: 1, rotationY: 0, scale: 1, duration: 0.8, ease: "power2.out" },
                3.2,
              )
              .to(".dive-shade", { backgroundColor: "rgba(8,8,8,.3)", duration: 0.8 }, 3.2);
            gsap.from(".footer-invitation", {
              y: 70,
              opacity: 0,
              duration: 1.15,
              ease: "power3.out",
              scrollTrigger: { trigger: ".footer-invitation", start: "top 90%", once: true },
            });
            gsap.utils.toArray<HTMLElement>(".footer-lettering > img").forEach((letter, i) => {
              gsap.fromTo(
                letter,
                { scale: 1.35, xPercent: i ? 12 : -12 },
                {
                  scale: 0.86,
                  xPercent: i ? -3 : 3,
                  ease: "none",
                  scrollTrigger: {
                    trigger: ".cinematic-footer",
                    start: "top bottom",
                    end: "bottom bottom",
                    scrub: 0.8,
                  },
                },
              );
            });
            gsap.fromTo(
              ".about-section",
              { clipPath: "inset(12vh 0 0 0 round 4vw)" },
              {
                clipPath: "inset(0vh 0 0 0 round 0vw)",
                ease: "none",
                scrollTrigger: {
                  trigger: "#sobre",
                  start: "top bottom",
                  end: "top 18%",
                  scrub: 0.7,
                },
              },
            );
            media.add("(hover: hover) and (pointer: fine)", () => {
              const hero = root.current?.querySelector<HTMLElement>(".hero-section");
              const portrait = hero?.querySelector<HTMLElement>(".hero-portrait img");
              if (!hero || !portrait) return;
              const halo = hero.querySelector<HTMLElement>(".halo-depth");
              const haloX = halo
                ? gsap.quickTo(halo, "x", { duration: 1, ease: "power3.out" })
                : null;
              const haloY = halo
                ? gsap.quickTo(halo, "y", { duration: 1, ease: "power3.out" })
                : null;
              const x = gsap.quickTo(portrait, "x", { duration: 0.65, ease: "power3.out" });
              const y = gsap.quickTo(portrait, "y", { duration: 0.65, ease: "power3.out" });
              const move = (event: PointerEvent) => {
                if (motionBlocked() || hero.dataset["motionActive"] === "false") return;
                const rect = hero.getBoundingClientRect();
                haloX?.(((event.clientX - rect.left) / rect.width - 0.5) * -18);
                haloY?.(((event.clientY - rect.top) / rect.height - 0.5) * -12);
                x(((event.clientX - rect.left) / rect.width - 0.5) * 22);
                y(((event.clientY - rect.top) / rect.height - 0.5) * 14);
              };
              const glass = (event: PointerEvent) => {
                const button = (event.target as HTMLElement).closest<HTMLElement>(".cta");
                if (!button || motionBlocked()) return;
                const bounds = button.getBoundingClientRect();
                button.style.setProperty(
                  "--glass-x",
                  `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
                );
                button.style.setProperty(
                  "--glass-y",
                  `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
                );
              };
              const site = root.current;
              site?.addEventListener("pointermove", glass, { passive: true });
              const reset = () => {
                haloX?.(0);
                haloY?.(0);
                x(0);
                y(0);
              };
              hero.addEventListener("pointermove", move);
              hero.addEventListener("pointerleave", reset);
              return () => {
                site?.removeEventListener("pointermove", glass);
                hero.removeEventListener("pointermove", move);
                hero.removeEventListener("pointerleave", reset);
              };
            });
            media.add("(min-width: 900px)", () => {
              const stack = gsap.utils.toArray<HTMLElement>(".story-card");
              stack.forEach((card, i) => {
                const next = stack[i + 1];
                if (next)
                  gsap.to(card, {
                    scale: 0.94,
                    opacity: 0.25,
                    rotation: -3,
                    ease: "none",
                    scrollTrigger: { trigger: next, start: "top 75%", end: "top 25%", scrub: true },
                  });
              });
              gsap.to(".hero-portrait-inner", {
                y: 20,
                ease: "none",
                scrollTrigger: {
                  trigger: "#inicio",
                  start: "top top",
                  end: "bottom top",
                  scrub: 1,
                },
              });
            });
          });
        }, root);
        const refresh = () => {
          if (!disposed) ScrollTrigger.refresh();
        };
        void document.fonts.ready.then(refresh);
        window.addEventListener("load", refresh);
        cleanup = () => {
          window.removeEventListener("load", refresh);
          media.revert();
          ctx.revert();
        };
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, [root, ready]);
}
