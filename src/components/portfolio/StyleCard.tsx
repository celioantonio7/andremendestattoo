import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import "@/style-cards.css";

function StyleFrame() {
  return (
    <svg
      className="style-frame"
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="style-frame-base"
        d="M90 2H388L398 12V510L310 598H12L2 588V100Z"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="style-frame-light"
        d="M90 2H388L398 12V510L310 598H12L2 588V100Z"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="style-frame-corners"
        d="M2 112V100L90 2H154 M398 488V510L310 598H246"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="style-frame-spark"
        pathLength="100"
        d="M90 2H388L398 12V510L310 598H12L2 588V100Z"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type Style = { name: string; src: string; text: string; detail: string };
export function StyleCard({ style, index }: { style: Style; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const front = useRef<HTMLButtonElement>(null),
    back = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!flipped) return;
    const reset = () => {
      const restoreFocus = back.current?.parentElement?.contains(document.activeElement);
      setFlipped(false);
      if (restoreFocus) requestAnimationFrame(() => front.current?.focus({ preventScroll: true }));
    };
    window.addEventListener("scroll", reset, { passive: true, once: true });
    return () => window.removeEventListener("scroll", reset);
  }, [flipped]);
  const flip = (next: boolean) => {
    setFlipped(next);
    requestAnimationFrame(() => (next ? back : front).current?.focus({ preventScroll: true }));
  };
  return (
    <article className={`style-card style-${index} style-flip-card`} data-flipped={flipped}>
      <div className="style-flipper">
        <button
          ref={front}
          className="style-face style-front"
          onClick={() => flip(true)}
          aria-label={`Ver detalhes sobre ${style.name}`}
          tabIndex={flipped ? -1 : 0}
          aria-hidden={flipped}
        >
          <span className="style-front-art">
            <img
              src={style.src}
              alt={`Tatuagem de André Mendes — ${style.name}`}
              width="512"
              height="768"
              loading="eager"
            />
          </span>
          <StyleFrame />
          <span className="style-hover-info">
            <strong>{style.name}</strong>
            <span>
              <span>{style.text}</span>
            </span>
          </span>
        </button>
        <div className="style-face style-back" aria-hidden={!flipped}>
          <span className="style-back-art" aria-hidden="true" />
          <StyleFrame />
          <button
            ref={back}
            className="style-return-surface"
            onClick={() => flip(false)}
            tabIndex={flipped ? 0 : -1}
            aria-label={`Mostrar arte de ${style.name}`}
          />
          <span className="eyebrow">ESTILO / 0{index + 1}</span>
          <h3>{style.name}</h3>
          <p className="style-back-lead">{style.text}</p>
          <p>{style.detail}</p>
          <a className="cta" href="#portfolio" tabIndex={flipped ? 0 : -1}>
            Ver trabalhos <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </article>
  );
}
