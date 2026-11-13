import { useEffect, type RefObject } from "react";
import { motionBlocked } from "./motionActivity";

export function useCardInteractions(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const site = root.current;
    if (!site) return;
    const fine = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let active: HTMLElement | null = null;
    let frame = 0;
    let point = { x: 0, y: 0 };
    const reset = () => {
      active
        ?.querySelectorAll<HTMLElement>(
          ".style-front-art img,.style-cutout,.story-art,.step-icon-frame",
        )
        .forEach((image) => {
          image.style.translate = "";
          image.style.scale = "";
        });
      active = null;
    };
    const draw = () => {
      frame = 0;
      if (!active) return;
      const rect = active.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((point.x - rect.left) / rect.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((point.y - rect.top) / rect.height) * 2 - 1));
      active
        .querySelectorAll<HTMLElement>(
          ".style-front-art img,.style-cutout,.story-art,.step-icon-frame",
        )
        .forEach((image) => {
          const distance = image.classList.contains("step-icon-frame") ? 3 : 7;
          image.style.translate = `${x * -distance}px ${y * -distance}px`;
          if (image.classList.contains("story-art")) image.style.scale = "1.04";
        });
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || motionBlocked()) {
        reset();
        return;
      }
      const target = event.target as Element;
      const card = target.closest<HTMLElement>(".style-front,.story-inner,.process-surface");
      if (card !== active) {
        reset();
        active = card;
      }
      point = { x: event.clientX, y: event.clientY };
      if (active && !frame) frame = requestAnimationFrame(draw);
      const button = target.closest<HTMLElement>(".header-booking,.round-button,.footer-expand");
      if (button) {
        const box = button.getBoundingClientRect();
        button.style.setProperty("--glass-x", `${((event.clientX - box.left) / box.width) * 100}%`);
        button.style.setProperty("--glass-y", `${((event.clientY - box.top) / box.height) * 100}%`);
      }
    };
    site.addEventListener("pointermove", move, { passive: true });
    site.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", reset, { passive: true });
    fine.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      reset();
      site.removeEventListener("pointermove", move);
      site.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", reset);
      fine.removeEventListener("change", reset);
    };
  }, [root]);
}
