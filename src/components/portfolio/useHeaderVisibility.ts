import { useEffect, type RefObject } from "react";

export function useHeaderVisibility(root: RefObject<HTMLDivElement | null>, menuOpen: boolean) {
  useEffect(() => {
    const header = root.current?.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    let last = window.scrollY,
      frame = 0;
    const update = () => {
      const y = window.scrollY;
      if (menuOpen || y < 100) header.dataset["hidden"] = "false";
      else if (Math.abs(y - last) > 8) header.dataset["hidden"] = String(y > last);
      if (Math.abs(y - last) > 8) last = y;
      header.dataset["scrolled"] = String(y > 70);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [root, menuOpen]);
}
