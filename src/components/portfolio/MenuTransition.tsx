import { useEffect, useRef } from "react";
import { holdBackgroundMotion } from "./motionActivity";

import { navigationEvent } from "./sectionNavigation";

export function MenuTransition() {
  const root = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    let disposed = false,
      running = false;
    let release = () => {};
    let animation: { kill: () => void } | undefined;
    let navigationFrame = 0;
    const navigate = async (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      if (!/^#[\w-]+$/.test(href) || running) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      let pinnedStart: number | undefined;
      const jump = () => {
        history.pushState(history.state, "", href);
        const place = () => {
          const padding =
            parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
          window.scrollTo({
            top: (pinnedStart ?? target.getBoundingClientRect().top + scrollY) - padding,
            behavior: "instant",
          });
          target.tabIndex = -1;
          target.focus({ preventScroll: true });
        };
        // TanStack restores hash positions after pushState. Place the pinned scene
        // after that restoration, while the transition curtain still covers it.
        navigationFrame = requestAnimationFrame(() => {
          navigationFrame = requestAnimationFrame(place);
        });
      };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        jump();
        return;
      }
      running = true;
      release = holdBackgroundMotion();
      root.current?.setAttribute("data-active", "true");
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        // A pinned section's DOM rectangle includes its current pin translation.
        // Navigate to the measured scene start, including when returning from below it.
        pinnedStart = ScrollTrigger.getAll().find(
          (trigger) => trigger.trigger === target && trigger.pin,
        )?.start;
        if (disposed) return;
        const progress = { value: 0 };
        const draw = (leaving: boolean) => {
          const x = -40 + progress.value * 180;
          path.current?.setAttribute(
            "d",
            leaving
              ? `M${x} 0 H140 V100 H${x} C${x - 25} 70 ${x + 25} 30 ${x} 0 Z`
              : `M-40 0 H${x} C${x + 25} 30 ${x - 25} 70 ${x} 100 H-40 Z`,
          );
        };
        draw(false);
        animation = gsap
          .timeline({
            onComplete: () => {
              root.current?.setAttribute("data-active", "false");
              running = false;
              release();
            },
          })
          .to(progress, {
            value: 1,
            duration: 0.5,
            ease: "power2.inOut",
            onUpdate: () => draw(false),
          })
          .call(jump)
          .set(progress, { value: 0 })
          .to(progress, {
            value: 1,
            duration: 0.55,
            ease: "power2.inOut",
            onUpdate: () => draw(true),
          });
      } catch {
        if (!disposed) {
          jump();
          root.current?.setAttribute("data-active", "false");
          running = false;
          release();
        }
      }
    };
    window.addEventListener(navigationEvent, navigate);
    return () => {
      disposed = true;
      animation?.kill();
      cancelAnimationFrame(navigationFrame);
      release();
      window.removeEventListener(navigationEvent, navigate);
    };
  }, []);
  return (
    <div ref={root} className="menu-curtain" data-active="false" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path ref={path} d="M0 0" />
      </svg>
      <img src="/art/am-logo.webp" alt="" width="140" height="95" />
    </div>
  );
}
