import { SurfaceSmoke } from "./SurfaceSmoke";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
  type CSSProperties,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { activityEvent, motionBlocked } from "./motionActivity";
import { ArrowRight, Play } from "lucide-react";
import { art } from "./content";

export function Tilt({
  children,
  className = "",
  style,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const node = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (
      !window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const el = node.current;
    if (!el) return;
    if (!disabled)
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-8px) scale(1.035)`;
    el.style.setProperty("--light-x", `${x * 100}%`);
    el.style.setProperty("--light-y", `${y * 100}%`);
  };
  return (
    <div
      className={`tilt-wrap ${className}`}
      style={style}
      onPointerMove={move}
      onPointerLeave={() => {
        if (node.current) node.current.style.transform = "";
      }}
    >
      <div ref={node} className="tilt-surface">
        {children}
        <SurfaceSmoke />
        <span className="paper-lens" aria-hidden="true" />
        <span className="card-glare" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Magnetic({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`cta magnetic ${className}`}
      onPointerMove={(e) => {
        if (
          !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.transform = `translate(${Math.max(-6, Math.min(6, (e.clientX - r.left - r.width / 2) * 0.06))}px,${Math.max(-6, Math.min(6, (e.clientY - r.top - r.height / 2) * 0.08))}px)`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
    >
      {children}
      <ArrowRight size={21} />
    </a>
  );
}

export function ArtworkCarousel({
  hero = false,
  onOpen,
}: {
  hero?: boolean;
  onOpen?: (index: number, trigger: HTMLElement) => void;
}) {
  const [autoplay] = useState(() =>
    AutoScroll({
      speed: hero ? 0.85 : 0.7,
      startDelay: 0,
      playOnInit: false,
      stopOnInteraction: true,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [viewport, api] = useEmblaCarousel(
    { loop: true, align: "center", duration: 25, watchDrag: true },
    [autoplay],
  );
  const [selected, setSelected] = useState(0);

  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    api.on("select", update);
    const playEvent = "autoScroll:play";
    const stopEvent = "autoScroll:stop";
    const onPlay = () => {
      if (root.current) root.current.dataset["autoplay"] = "true";
    };
    const onStop = () => {
      if (root.current) root.current.dataset["autoplay"] = "false";
    };
    api.on(playEvent, onPlay);
    api.on(stopEvent, onStop);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false,
      imageHovered = false,
      dragging = false;
    let hoverFrame = 0;
    let lastPointer: { x: number; y: number } | null = null;
    const sync = () => {
      if (
        !media.matches &&
        !document.hidden &&
        !motionBlocked() &&
        inView &&
        !dragging &&
        !(
          !hero &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          imageHovered
        ) &&
        (hero || !root.current?.querySelector(":focus-visible"))
      ) {
        if (!autoplay.isPlaying()) autoplay.play();
        else api.internalEngine().animation.start();
      } else if (autoplay.isPlaying()) {
        autoplay.stop();
        api.internalEngine().animation.stop();
      }
    };
    const refreshHover = () => {
      hoverFrame = 0;
      const node = lastPointer ? document.elementFromPoint(lastPointer.x, lastPointer.y) : null;
      const image = node?.closest(".artwork-button")?.querySelector("img");
      const bounds = image?.getBoundingClientRect();
      imageHovered =
        !!bounds &&
        !!lastPointer &&
        lastPointer.x >= bounds.left &&
        lastPointer.x <= bounds.right &&
        lastPointer.y >= bounds.top &&
        lastPointer.y <= bounds.bottom;
      sync();
    };
    const pointer = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "touch") return;
      lastPointer = { x: event.clientX, y: event.clientY };
      refreshHover();
    };
    const scrolled = () => {
      if (!hero && !hoverFrame) hoverFrame = requestAnimationFrame(refreshHover);
    };
    const reinitialized = () => {
      dragging = false;
      update();
      refreshHover();
    };
    const leave = () => {
      lastPointer = null;
      imageHovered = false;
      sync();
    };
    const pointerDown = () => {
      dragging = true;
      sync();
    };
    const pointerUp = () => {
      dragging = false;
      sync();
    };
    api.on("pointerDown", pointerDown);
    api.on("pointerUp", pointerUp);
    api.on("settle", sync);
    api.on("reInit", reinitialized);
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    window.addEventListener("blur", pointerUp);
    window.addEventListener(activityEvent, sync);
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      if (!inView) {
        dragging = false;
        imageHovered = false;
      }
      if (root.current) root.current.dataset["inview"] = String(inView);
      sync();
    });
    if (root.current) observer.observe(root.current);
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    const el = root.current;
    el?.addEventListener("pointermove", pointer);
    el?.addEventListener("pointerleave", leave);
    el?.addEventListener("focusin", sync);
    el?.addEventListener("focusout", sync);
    return () => {
      api.off("select", update);
      api.off("pointerDown", pointerDown);
      api.off("pointerUp", pointerUp);
      api.off("settle", sync);
      api.off("reInit", reinitialized);
      cancelAnimationFrame(hoverFrame);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      window.removeEventListener("blur", pointerUp);
      window.removeEventListener(activityEvent, sync);
      api.off(playEvent, onPlay);
      api.off(stopEvent, onStop);
      observer.disconnect();
      autoplay.stop();
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
      el?.removeEventListener("pointermove", pointer);
      el?.removeEventListener("pointerleave", leave);
      el?.removeEventListener("focusin", sync);
      el?.removeEventListener("focusout", sync);
    };
  }, [api, autoplay, hero]);
  const movePhoto = (event: PointerEvent<HTMLElement>) => {
    if (
      event.buttons ||
      !window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const image = event.currentTarget.querySelector("img");
    if (!image) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    image.style.transition = "transform 180ms ease-out";
    image.style.transform = `translate(${x}px, ${y}px) scale(1.07)`;
  };
  const resetPhoto = (event: PointerEvent<HTMLElement>) => {
    const image = event.currentTarget.querySelector("img");
    if (image) image.style.transform = "";
  };
  return (
    <div
      ref={root}
      className={`art-carousel ${hero ? "hero-carousel" : "gallery-carousel"}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label={hero ? "Artes em destaque" : "Galeria de tatuagens de André Mendes"}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          api?.scrollNext();
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          api?.scrollPrev();
        }
      }}
    >
      <div ref={viewport} className="embla-viewport">
        <div className="embla-track">
          {art.map((work, i) => (
            <div
              className={`embla-slide ${selected === i ? "is-selected" : ""}`}
              key={`${work.name}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${art.length}`}
            >
              <div className="card-reveal">
                <div className="card-drift">
                  <Tilt disabled className={`art-card art-card-${i % 4}`}>
                    {hero ? (
                      <div
                        className="artwork-button hero-artwork"
                        onPointerMove={movePhoto}
                        onPointerLeave={resetPhoto}
                        onPointerDown={resetPhoto}
                      >
                        <img
                          src={work.src}
                          alt={`${work.name} — trabalho de ${work.style}`}
                          width="512"
                          height="768"
                          loading="eager"
                          draggable="false"
                        />
                      </div>
                    ) : (
                      <button
                        disabled={hero}
                        tabIndex={hero ? -1 : 0}
                        className="artwork-button"
                        onPointerMove={movePhoto}
                        onPointerLeave={resetPhoto}
                        onPointerDown={resetPhoto}
                        onClick={(e) => onOpen?.(i % art.length, e.currentTarget)}
                        aria-label={hero ? work.name : `Assistir ${work.name}`}
                      >
                        <img
                          src={work.src}
                          alt={`${work.name} — trabalho de ${work.style}`}
                          width="512"
                          height="768"
                          loading={hero ? "eager" : "lazy"}
                          draggable="false"
                        />
                        {"video" in work && (
                          <span className="video-play-glass" aria-hidden="true">
                            <Play size={24} fill="currentColor" />
                          </span>
                        )}
                        {!hero && (
                          <span className="artwork-caption">
                            <span>
                              <small>{work.style}</small>
                              <strong>{work.name}</strong>
                            </span>
                            <ArrowRight />
                          </span>
                        )}
                      </button>
                    )}
                  </Tilt>
                  {!hero && (
                    <div className="gallery-art-label">
                      <small>{work.style}</small>
                      <strong>{work.name}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
