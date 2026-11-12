import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { art } from "./content";
import { activityEvent, motionBlocked, useMotionOverlay } from "./motionActivity";

const reels = art.filter((work): work is typeof work & { video: string } => "video" in work);
const normalize = (angle: number) => ((((angle + 180) % 360) + 360) % 360) - 180;

export function ReelShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const controls = useRef<{ jump: (direction: number) => void; sync: () => void } | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [front, setFront] = useState<number[]>([]);
  const reel = selected === null ? null : reels[selected];
  useMotionOverlay(selected !== null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current || !ring.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const section = root.current;
        const element = ring.current;
        const media = gsap.matchMedia();
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const resize = () => {
          const width = Math.min(300, window.innerWidth * 0.58, window.innerHeight * 0.48);
          section.style.setProperty("--cylinder-width", `${width}px`);
          section.style.setProperty(
            "--cylinder-radius",
            `${(width / (2 * Math.tan(Math.PI / reels.length))) * 1.12}px`,
          );
        };
        resize();
        window.addEventListener("resize", resize);
        let inView = false,
          timer = 0,
          lastScroll = 0,
          angle = 0;
        let nearestIndex = -1;
        let triggerControl: ReturnType<typeof ScrollTrigger.create> | undefined;
        const disable = () => {
          setReady(false);
          section.dataset["settled"] = "false";
        };
        const settle = () => {
          window.clearTimeout(timer);
          if (disposed || !inView || document.hidden || motionBlocked()) {
            disable();
            return;
          }
          if (performance.now() - lastScroll < 180) {
            timer = window.setTimeout(settle, 180);
            return;
          }
          const scrub = triggerControl?.getTween();
          if (scrub?.isActive()) {
            timer = window.setTimeout(settle, 80);
            return;
          }
          const visible = reduced.matches
            ? reels.map((_, i) => i)
            : reels
                .map((_, i) => i)
                .filter((i) => Math.abs(normalize(angle + (i * 360) / reels.length)) < 56);
          setFront(visible);
          setReady(true);
          section.dataset["settled"] = "true";
        };
        const changed = () => {
          if (!inView || reduced.matches) return;
          lastScroll = performance.now();
          disable();
          window.clearTimeout(timer);
          timer = window.setTimeout(settle, 200);
        };
        const sync = () => {
          if (!motionBlocked() && !document.hidden) settle();
          else disable();
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = !!entry?.isIntersecting;
          section.dataset["active"] = String(inView);
          sync();
        });
        observer.observe(section);
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const ctx = gsap.context(() => {
            gsap.fromTo(
              ".cylinder-perspective",
              { scale: 0.72, y: 100 },
              {
                scale: 1,
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top top",
                  scrub: 0.65,
                },
              },
            );
            gsap.to(element, {
              rotationY: -360,
              ease: "none",
              scrollTrigger: {
                id: "video-cylinder",
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.65,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  disable();
                  section.dataset["progress"] = self.progress.toFixed(4);
                },
                onScrubComplete: settle,
              },
              onUpdate: () => {
                angle = Number(gsap.getProperty(element, "rotationY"));
                const next = Math.round(-angle / (360 / reels.length)) % reels.length;
                if (next !== nearestIndex) {
                  nearestIndex = next;
                  setCurrent(next);
                }
              },
            });
            triggerControl = ScrollTrigger.getById("video-cylinder");
          }, section);
          controls.current = {
            jump: (direction) => {
              if (!triggerControl) return;
              const step = 1 / reels.length;
              const progress = Math.max(
                0,
                Math.min(1, Math.round(triggerControl.progress / step) * step + direction * step),
              );
              window.scrollTo({
                top: triggerControl.start + progress * (triggerControl.end - triggerControl.start),
                behavior: "smooth",
              });
            },
            sync,
          };
          return () => {
            ctx.revert();
            controls.current = null;
          };
        });
        media.add("(prefers-reduced-motion: reduce)", () => {
          setFront(reels.map((_, i) => i));
          setReady(true);
          section.dataset["settled"] = "true";
          return () => {};
        });
        window.addEventListener("scroll", changed, { passive: true });
        window.addEventListener(activityEvent, sync);
        document.addEventListener("visibilitychange", sync);
        cleanup = () => {
          window.removeEventListener("resize", resize);
          observer.disconnect();
          media.revert();
          window.clearTimeout(timer);
          window.removeEventListener("scroll", changed);
          window.removeEventListener(activityEvent, sync);
          document.removeEventListener("visibilitychange", sync);
        };
      },
    );
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const pause = () => {
      if (document.hidden) video.current?.pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);

  return (
    <div
      ref={root}
      className="reel-showcase cylinder-section"
      id="trabalhos-em-movimento"
      data-settled="false"
    >
      <div
        className="cylinder-stage"
        role="region"
        aria-label="Galeria 3D de vídeos de André Mendes"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            controls.current?.jump(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div className="cylinder-scenery" aria-hidden="true">
          <img src="/works/work-7.webp" alt="" />
          <img src="/works/work-3.webp" alt="" />
        </div>
        <div className="reel-heading">
          <span className="eyebrow">TRABALHOS EM MOVIMENTO</span>
          <p>Histórias que ganham forma.</p>
        </div>
        <div className="cylinder-perspective">
          <div className="cylinder-camera">
            <div ref={ring} className="cylinder-ring">
              {reels.map((work, i) => (
                <div
                  className="cylinder-card"
                  key={work.src}
                  style={{
                    transform: `rotateY(${(i * 360) / reels.length}deg) translateZ(var(--cylinder-radius))`,
                  }}
                >
                  <button
                    className="cylinder-work"
                    disabled={!ready || !front.includes(i)}
                    tabIndex={ready && front.includes(i) ? 0 : -1}
                    data-facing={front.includes(i)}
                    aria-label={`Assistir ${work.name}`}
                    aria-describedby="cylinder-status"
                    onClick={(event) => {
                      if (!ready || motionBlocked()) return;
                      trigger.current = event.currentTarget;
                      setSelected(i);
                    }}
                  >
                    <img
                      src={work.src}
                      alt={work.name}
                      width="720"
                      height="1280"
                      loading="lazy"
                      draggable="false"
                    />
                    <span className="reel-play">
                      <Play fill="currentColor" size={23} />
                    </span>
                    <span className="reel-caption">
                      <span>{work.name}</span>
                      <ArrowUpRight size={21} />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cylinder-caption">
          <span>{reels[current]?.name}</span>
          <p id="cylinder-status" role="status">
            {ready
              ? "Escolha um trabalho para assistir."
              : "Role para explorar. Pare para assistir."}
          </p>
        </div>
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="art-lightbox reel-lightbox"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            requestAnimationFrame(() => {
              controls.current?.sync();
              trigger.current?.focus({ preventScroll: true });
            });
          }}
        >
          <DialogTitle>{reel?.name || "Trabalho em vídeo"}</DialogTitle>
          <DialogDescription>Vídeo do perfil oficial de André Mendes.</DialogDescription>
          {reel && (
            <video
              ref={video}
              key={reel.video}
              src={reel.video}
              poster={reel.src}
              controls
              playsInline
              preload="metadata"
              aria-label={`Vídeo: ${reel.name}`}
            />
          )}
          <a className="reel-original" href={reel?.source} target="_blank" rel="noreferrer">
            Ver publicação original <ArrowUpRight size={16} />
          </a>
        </DialogContent>
      </Dialog>
    </div>
  );
}
