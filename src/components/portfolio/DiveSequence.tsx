import { ArrowDown, ArrowUpRight } from "lucide-react";
import { art } from "./content";
export function DiveSequence() {
  const photos = [art[0]!, art[3]!, art[1]!];
  return (
    <div className="dive-sequence" aria-label="Imersão nos detalhes dos trabalhos">
      <div className="dive-stage">
        <div className="dive-scenery" aria-hidden="true">
          <img src="/works/work-6.webp" alt="" />
          <img src="/art/mandala.webp" alt="" />
        </div>
        {photos.map((photo, i) => (
          <div key={photo.src} className={`dive-layer dive-layer-${i + 1}`}>
            <img
              src={photo.src}
              alt={`${photo.name}, tatuagem de André Mendes`}
              width="640"
              height="850"
              loading="lazy"
            />
          </div>
        ))}
        <div className="dive-shade" aria-hidden="true" />
        <div className="dive-intro">
          <span>APROXIME O OLHAR.</span>
          <span>CADA DETALHE CONTA UMA HISTÓRIA.</span>
        </div>
        <div className="dive-copy">
          <h3>
            ARTE QUE
            <br />
            <em>FICA.</em>
          </h3>
          <a href="#contato" className="cta">
            Sua próxima tatuagem <ArrowUpRight size={20} />
          </a>
        </div>
        <span className="dive-scroll">
          MERGULHE NOS DETALHES <ArrowDown size={15} />
        </span>
      </div>
    </div>
  );
}
