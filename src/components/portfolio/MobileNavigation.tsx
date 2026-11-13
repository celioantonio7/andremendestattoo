import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Content as ModalContent } from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMotionOverlay } from "./motionActivity";
import { navigateToSection } from "./sectionNavigation";
import { nav } from "./content";

function CyberLabel({ label }: { label: string }) {
  const [text, setText] = useState(label);
  useEffect(() => {
    if (
      !matchMedia("(max-width: 899px)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 350);
      setText(
        [...label]
          .map((char, i) =>
            i < progress * label.length || char === " "
              ? char
              : glyphs[Math.floor(Math.random() * glyphs.length)],
          )
          .join(""),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [label]);
  return (
    <span className="cyber-label" aria-hidden="true">
      {text}
    </span>
  );
}

export function MobileNavigation({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const destination = useRef<string | null>(null);
  useMotionOverlay(open);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 900px)");
    const close = () => {
      if (desktop.matches) onOpenChange(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, [onOpenChange]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="mobile-menu round-button" aria-label="Abrir menu" aria-expanded={open}>
          <Menu />
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <ModalContent
          className="animated-mobile-menu"
          onCloseAutoFocus={(event) => {
            if (!destination.current) return;
            event.preventDefault();
            const href = destination.current;
            destination.current = null;
            requestAnimationFrame(() => navigateToSection(href));
          }}
        >
          <DialogTitle className="sr-only">Menu André Mendes</DialogTitle>
          <DialogDescription className="sr-only">Escolha uma seção do portfólio.</DialogDescription>
          <img
            className="mobile-menu-brand"
            src="/art/am-logo.webp"
            alt="AM"
            width="100"
            height="68"
          />
          <nav aria-label="Navegação mobile">
            {nav.map(([label, href], i) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                style={{ "--item": i } as CSSProperties}
                onClick={(event) => {
                  event.preventDefault();
                  destination.current = href || null;
                  onOpenChange(false);
                }}
              >
                <span className="menu-word">
                  <CyberLabel label={label!} />
                </span>
              </a>
            ))}
          </nav>
          <span className="mobile-menu-caption">ARTE / TÉCNICA / IDENTIDADE</span>
          <DialogClose aria-label="Fechar menu">
            <X size={24} />
          </DialogClose>
        </ModalContent>
      </DialogPortal>
    </Dialog>
  );
}
