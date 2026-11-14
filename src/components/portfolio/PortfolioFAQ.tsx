import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { bookingUrl } from "./content";
import "@/portfolio-faq.css";

const questions = [
  {
    question: "O que preciso enviar para pedir um orçamento?",
    answer:
      "Conte sua ideia, o tamanho aproximado e a região do corpo onde quer tatuar. Envie também as referências que ajudam a mostrar o que você tem em mente. Com essas informações, André pode avaliar o projeto e conversar sobre o orçamento.",
  },
  {
    question: "O desenho é criado para mim?",
    answer:
      "Sim. O projeto nasce de uma construção em conjunto: sua história, suas referências e o olhar do artista. A composição é desenvolvida para a sua ideia e para a região do corpo escolhida.",
  },
  {
    question: "Como faço para agendar?",
    answer:
      "Entre em contato pelo WhatsApp para apresentar sua ideia. Você combina o projeto, a disponibilidade e os próximos passos diretamente com André.",
  },
  {
    question: "Como me preparar para a sessão?",
    answer:
      "Antes da sessão, confirme com André as orientações de preparo para o seu atendimento. Aproveite a conversa para tirar dúvidas e informar qualquer questão que precise ser considerada no planejamento.",
  },
  {
    question: "Vou receber orientações de cuidados?",
    answer:
      "Sim. André explica os cuidados para a sua tatuagem e orienta como acompanhar essa etapa. Se surgir alguma dúvida sobre as instruções recebidas, entre em contato com ele para esclarecer.",
  },
];

export function PortfolioFAQ() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  useEffect(() => {
    const node = root.current;
    let frame = 0;
    let disposed = false;
    const desktopMotion = window.matchMedia(
      "(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const refresh = (event: TransitionEvent) => {
      if (!desktopMotion.matches || event.propertyName !== "grid-template-rows") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          if (!disposed && desktopMotion.matches) ScrollTrigger.refresh();
        });
      });
    };
    // Touch layouts use native document flow: refreshing desktop pins while an
    // answer changes size can reset the scroll position on mobile browsers.
    node?.addEventListener("transitionend", refresh);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      node?.removeEventListener("transitionend", refresh);
    };
  }, []);
  return (
    <div ref={root} className="portfolio-faq">
      <div className="portfolio-faq-list">
        {questions.map(({ question, answer }, index) => (
          <div className="portfolio-faq-item" data-open={openIndex === index} key={question}>
            <h3 className="portfolio-faq-heading">
              <button
                type="button"
                id={`${id}-question-${index}`}
                aria-expanded={openIndex === index}
                aria-controls={`${id}-answer-${index}`}
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              >
                <span className="portfolio-faq-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="portfolio-faq-question">{question}</span>
                <Plus className="portfolio-faq-plus" size={21} aria-hidden="true" />
              </button>
            </h3>
            <div
              className="portfolio-faq-panel"
              id={`${id}-answer-${index}`}
              role="region"
              aria-labelledby={`${id}-question-${index}`}
              inert={openIndex !== index}
            >
              <div className="portfolio-faq-panel-inner">
                <div className="portfolio-faq-answer">
                  <p>{answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <a className="portfolio-faq-contact" href={bookingUrl} target="_blank" rel="noreferrer">
        Conversar sobre minha ideia <ArrowUpRight size={19} aria-hidden="true" />
      </a>
    </div>
  );
}
