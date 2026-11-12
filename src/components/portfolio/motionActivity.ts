import { useEffect, type RefObject } from "react";

const holds = new Set<symbol>();
export const activityEvent = "portfolio:motion-activity";
export const motionBlocked = () => holds.size > 0;

export function holdBackgroundMotion() {
  const token = Symbol();
  holds.add(token);
  const notify = () => {
    document.documentElement.dataset["motionBlocked"] = String(motionBlocked());
    window.dispatchEvent(new Event(activityEvent));
  };
  notify();
  return () => {
    holds.delete(token);
    notify();
  };
}

export function useMotionOverlay(open: boolean) {
  useEffect(() => {
    if (open) return holdBackgroundMotion();
    return undefined;
  }, [open]);
}

export function useSectionActivity(root: RefObject<HTMLElement | null>, ready: boolean) {
  useEffect(() => {
    if (!ready || !root.current) return;
    const visibility = () => {
      document.documentElement.dataset["motionHidden"] = String(document.hidden);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        (entry.target as HTMLElement).dataset["motionActive"] = String(entry.isIntersecting);
      }
    });
    root.current
      .querySelectorAll("main section, .cinematic-footer")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [root, ready]);
}
