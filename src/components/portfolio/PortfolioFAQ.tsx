import { useEffect, useId, useRef } from "react";
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
  useEffect(() => {
    const node = root.current;
    let frame = 0;
    let disposed = false;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          if (!disposed) ScrollTrigger.refresh();
        });
      });
    };
    // Native toggle does not bubble. Measure downstream pins after the answer's
    // final layout, including when opening one answer closes another.
    node?.addEventListener("toggle", refresh, true);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      node?.removeEventListener("toggle", refresh, true);
    };
  }, []);
  return (
    <div ref={root} className="portfolio-faq">
      <div className="portfolio-faq-list">
        {questions.map(({ question, answer }, index) => (
          <details className="portfolio-faq-item" name={`${id}-questions`} key={question}>
            <summary>
              <span className="portfolio-faq-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="portfolio-faq-question">{question}</span>
              <Plus className="portfolio-faq-plus" size={21} aria-hidden="true" />
            </summary>
            <div className="portfolio-faq-answer">
              <p>{answer}</p>
            </div>
          </details>
        ))}
      </div>
      <a className="portfolio-faq-contact" href={bookingUrl} target="_blank" rel="noreferrer">
        Conversar sobre minha ideia <ArrowUpRight size={19} aria-hidden="true" />
      </a>
    </div>
  );
}
