import { BrandIcon } from "./BrandIcon";
import { useEffect, useRef } from "react";
import { bookingUrl } from "./content";

export function FloatingWhatsApp() {
  const link = useRef<HTMLAnchorElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const drag = useRef<{
    pointer: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const moved = useRef(false);
  const place = (x: number, y: number) => {
    const el = link.current;
    if (!el) return;
    const size = el.offsetWidth;
    position.current = {
      x: Math.max(12, Math.min(window.innerWidth - size - 12, x)),
      y: Math.max(12, Math.min(window.innerHeight - size - 12, y)),
    };
    el.style.transform = `translate3d(${position.current.x}px,${position.current.y}px,0)`;
  };
  const reset = () => place(window.innerWidth - 88, window.innerHeight - 88);
  useEffect(() => {
    reset();
    const resize = () => place(position.current.x, position.current.y);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // Place once, then preserve the user's position between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <a
        ref={link}
        className="floating-whatsapp"
        href={bookingUrl || "#contato"}
        aria-label="WhatsApp — contato e agendamento"
        aria-describedby="whatsapp-drag-help"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          moved.current = false;
          drag.current = {
            pointer: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            ...position.current,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const active = drag.current;
          if (!active || active.pointer !== e.pointerId) return;
          const dx = e.clientX - active.startX,
            dy = e.clientY - active.startY;
          if (Math.hypot(dx, dy) > 6) moved.current = true;
          if (moved.current) place(active.x + dx, active.y + dy);
        }}
        onPointerUp={(e) => {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onClick={(e) => {
          if (moved.current) {
            e.preventDefault();
            moved.current = false;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            reset();
            return;
          }
          if (!e.altKey) return;
          const delta: Record<string, [number, number]> = {
            ArrowLeft: [-16, 0],
            ArrowRight: [16, 0],
            ArrowUp: [0, -16],
            ArrowDown: [0, 16],
          };
          const change = delta[e.key];
          if (change) {
            e.preventDefault();
            place(position.current.x + change[0], position.current.y + change[1]);
          }
        }}
      >
        <span className="whatsapp-brand-disc">
          <BrandIcon brand="whatsapp" size={38} />
        </span>
      </a>
      <span className="sr-only" id="whatsapp-drag-help">
        Arraste para reposicionar. No teclado, use Alt e as setas. Escape devolve ao canto inferior.{" "}
        {bookingUrl ? "" : "Canal de WhatsApp em configuração; abre a seção de contato."}
      </span>
    </>
  );
}
