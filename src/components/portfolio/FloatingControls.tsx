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
        <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" fill="none">
          <path
            d="M39.4 8.6A21.1 21.1 0 0 0 6.3 34L3 45l11.3-3A21 21 0 0 0 39.4 8.6Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M17.4 12.6c-.6-1.3-1.3-1.3-1.9-1.3h-1.6c-.5 0-1.3.2-1.9 1-.7.8-2.5 2.5-2.5 6.1s2.6 7.1 3 7.6c.4.5 5.2 8.1 12.9 11 6.4 2.5 7.7 2 9.1 1.9 1.4-.2 4.6-1.9 5.2-3.7.7-1.8.7-3.4.5-3.7-.2-.3-.7-.5-1.5-.9l-4.6-2.2c-.6-.2-1.2-.3-1.7.5l-2.1 2.5c-.4.4-.8.5-1.5.2-.8-.4-3.3-1.2-6.2-3.8-2.3-2-3.8-4.5-4.2-5.2-.4-.8 0-1.2.3-1.5l1.3-1.6c.4-.5.5-.8.7-1.3.2-.5 0-.9-.2-1.3l-2.1-4.3Z"
            fill="white"
            transform="translate(4 3) scale(.77)"
          />
        </svg>
      </a>
      <span className="sr-only" id="whatsapp-drag-help">
        Arraste para reposicionar. No teclado, use Alt e as setas. Escape devolve ao canto inferior.{" "}
        {bookingUrl ? "" : "Canal de WhatsApp em configuração; abre a seção de contato."}
      </span>
    </>
  );
}
