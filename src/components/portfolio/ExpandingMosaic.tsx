import { useEffect, useRef } from "react";
import { SerpentineRibbon } from "./SerpentineRibbon";
import { ArrowDown, ArrowUpRight } from "lucide-react";
export type MosaicItem = { name: string; src: string; source: string };
export function ExpandingMosaic({ items, title }: { items: MosaicItem[]; title: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false,
      cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const desktopMotion =
          "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
        const scene = root.current,
          media = gsap.matchMedia();
        media.add(desktopMotion, () => {
          const context = gsap.context(() => {
            const timeline = gsap.timeline({
              onUpdate: () => {
                const expanded = timeline.time() >= 1.06;
                if (scene.dataset["expanded"] !== String(expanded))
                  scene.dataset["expanded"] = String(expanded);
              },
              scrollTrigger: {
                trigger: scene,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            });
            gsap.utils.toArray<HTMLElement>(".mosaic-satellite", scene).forEach((card, i) => {
              timeline.to(
                card,
                {
                  xPercent: i % 2 === 0 ? -190 : 190,
                  yPercent: i < 3 ? -70 : 90,
                  scale: 1.65,
                  opacity: 0,
                  ease: "none",
                  duration: 0.85,
                },
                0.12,
              );
            });
            timeline
              .to(".mosaic-heading", { y: -65, opacity: 0, duration: 0.25, ease: "none" }, 0.12)
              .fromTo(
                ".mosaic-focus",
                {
                  width: () => (innerWidth < 900 ? "42%" : "30%"),
                  height: "43%",
                  top: "54%",
                  borderRadius: 18,
                },
                {
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  borderRadius: 0,
                  duration: 1,
                  ease: "none",
                },
                0.05,
              )
              .fromTo(
                ".mosaic-focus img",
                { scale: 1.02 },
                { scale: 1, duration: 1, ease: "none" },
                0.05,
              )
              .to(".mosaic-scroll", { opacity: 0, duration: 0.2 }, 0.12)
              .fromTo(
                ".mosaic-finale",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.25 },
                1.08,
              )
              .fromTo(".serpentine-ribbon", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 1.1)
              .to({}, { duration: 1.8 });
          }, scene);
          return () => context.revert();
        });
        cleanup = () => media.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);
  return (
    <div ref={root} className="expanding-mosaic detail-mosaic dive-sequence">
      <div className="mosaic-stage" role="region" aria-label={title}>
        <div className="motion-section-art" aria-hidden="true" />
        <div className="mosaic-heading">
          <h3>{title}</h3>
          <p>Cada detalhe conta uma história.</p>
        </div>
        <div className="mosaic-layout">
          {items.slice(0, 8).map((item, i) => (
            <figure
              className={`mosaic-card ${i === 0 ? "mosaic-focus" : `mosaic-satellite mosaic-slot-${i}`}`}
              key={item.src}
            >
              <img
                src={item.src}
                alt={item.name}
                width="1080"
                height="1920"
                loading="lazy"
                draggable="false"
              />
              <figcaption className="mosaic-caption">{item.name}</figcaption>
            </figure>
          ))}
        </div>
        <SerpentineRibbon />
        <div className="mosaic-finale">
          <h3>
            ARTE QUE <em>FICA.</em>
          </h3>
          <a className="cta" href="#contato">
            Sua próxima tatuagem <ArrowUpRight size={19} />
          </a>
        </div>
        <span className="mosaic-scroll">
          MERGULHE NOS DETALHES <ArrowDown size={15} />
        </span>
      </div>
    </div>
  );
}
