import { Home, Images } from "lucide-react";
export function NotFoundPage() {
  const base = import.meta.env.BASE_URL;
  return (
    <main className="not-found-page">
      <div className="not-found-art" aria-hidden="true">
        <img src="/art/notfound-scene.png" alt="" />
      </div>
      <a className="not-found-brand" href={base} aria-label="André Mendes — início">
        <img src="/art/am-logo.webp" alt="AM" width="140" height="95" />
      </a>
      <div className="not-found-content">
        <p className="eyebrow">PÁGINA NÃO ENCONTRADA</p>
        <h1>
          <span className="sr-only">404</span>
          <img src="/art/404.png" alt="" width="710" height="301" />
        </h1>
        <p>
          Ops! A página que você procura não existe
          <br />
          ou foi removida.
        </p>
        <div className="not-found-actions">
          <a href={base} className="cta">
            <Home size={22} />
            Voltar ao início
          </a>
          <a href={`${base}#portfolio`} className="cta">
            <Images size={22} />
            Ver portfólio
          </a>
        </div>
      </div>
    </main>
  );
}
