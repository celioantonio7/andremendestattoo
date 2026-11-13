import { useEffect, useId, useRef } from "react";
import { activityEvent, motionBlocked } from "./motionActivity";
const phrase = "A SUA HISTÓRIA GANHA FORMA • ";
export function SerpentineRibbon() {
  const id = `serpentine-${useId().replace(/:/g, "")}`;
  const root = useRef<HTMLDivElement>(null),
    path = useRef<SVGPathElement>(null),
    textPath = useRef<SVGTextPathElement>(null),
    text = useRef<SVGTextElement>(null);
  useEffect(() => {
    const element = root.current,
      curve = path.current,
      letters = textPath.current;
    const scene = element?.closest<HTMLElement>(".detail-mosaic");
    if (!element || !curve || !letters || !scene) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      previous = 0,
      phase = 0,
      bend = 0,
      velocity = 0,
      boost = 0,
      speed = 1,
      lastY = scrollY,
      inView = false,
      period = 2200,
      width = 1600,
      disposed = false;
    let lastScroll = performance.now();
    const measure = () => {
      if (disposed) return;
      const measured = text.current?.getSubStringLength(0, phrase.length * 2);
      if (measured && measured > 0) {
        phase = (phase / period) * measured;
        period = measured;
      }
    };
    const size = () => {
      width = element.getBoundingClientRect().width || 1600;
      element.querySelector("svg")?.setAttribute("viewBox", `0 0 ${width} 220`);
      measure();
    };
    const resize = new ResizeObserver(size);
    resize.observe(element);
    size();
    void document.fonts.ready.then(size);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = previous ? Math.min(50, now - previous) : 16;
      previous = now;
      const tension =
        performance.now() - lastScroll < 120 ? Math.min(12, Math.abs(velocity) * 0.003) : 0;
      bend += (tension - bend) * (1 - Math.exp(-dt / 230));
      boost *= Math.exp(-dt / 650);
      speed += (1 + boost - speed) * (1 - Math.exp(-dt / 100));
      phase = (phase + dt * (width < 600 ? 0.035 : 0.055) * speed) % period;
      element.dataset["speed"] = speed.toFixed(3);
      velocity *= Math.exp(-dt / 120);
      const amplitude = 48 + bend;
      let d = `M${-width * 2} 110`;
      for (let i = -2; i < 4; i++) {
        const x = i * width;
        d += ` C${x + width * 0.25} ${110 - amplitude} ${x + width * 0.25} ${110 - amplitude} ${x + width * 0.5} 110`;
        d += ` C${x + width * 0.75} ${110 + amplitude} ${x + width * 0.75} ${110 + amplitude} ${x + width} 110`;
      }
      curve.setAttribute("d", d);
      letters.setAttribute("startOffset", String(-phase));
      element.dataset["phase"] = phase.toFixed(1);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      const active =
        inView &&
        scene.dataset["expanded"] === "true" &&
        !document.hidden &&
        !motionBlocked() &&
        !reduced.matches;
      element.dataset["active"] = String(active);
      if (active) frame = requestAnimationFrame(draw);
      else {
        boost = 0;
        speed = 1;
        element.dataset["speed"] = "1.000";
      }
    };
    const scrolled = () => {
      const now = performance.now();
      const elapsed = Math.max(16, Math.min(80, now - lastScroll));
      velocity = ((scrollY - lastY) / elapsed) * 1000;
      lastY = scrollY;
      lastScroll = now;
      if (element.dataset["active"] === "true")
        boost = Math.max(boost, Math.min(3, Math.abs(velocity) / 1400));
    };
    const mutation = new MutationObserver(sync);
    mutation.observe(scene, { attributes: true, attributeFilter: ["data-expanded"] });
    const observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting;
      sync();
    });
    observer.observe(element);
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener(activityEvent, sync);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener(activityEvent, sync);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  return (
    <div ref={root} className="serpentine-ribbon">
      <p className="sr-only">A sua história ganha forma.</p>
      <svg viewBox="0 0 1600 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <path
            ref={path}
            id={id}
            d="M-1800 450 C-1350 40 -900 860 -450 450 S450 40 900 450 S2250 860 2700 450 S4050 40 4500 450"
          />
        </defs>
        <text ref={text}>
          <textPath ref={textPath} href={`#${id}`}>
            {Array.from({ length: 32 }, (_, i) => (
              <tspan key={i} fill={i % 2 === 0 ? "#fff9ee" : "#ff0015"}>
                {phrase}
              </tspan>
            ))}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
