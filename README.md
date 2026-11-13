# André Mendes — Tattoo Artist

Portfólio de André Mendes, tatuador em São José dos Campos. Site em português com galeria de trabalhos reais, vídeos, animações de rolagem, contato e página 404.

## Desenvolvimento

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 8081
```

## Verificação

```sh
npm run lint
npm test
npm run build
```

## GitHub Pages

O workflow `.github/workflows/pages.yml` publica a versão estática a partir da branch `main`.

```sh
VITE_SITE_URL=https://celioantonio7.github.io/andremendestattoo \
PAGES_BASE=/andremendestattoo/ npm run build:pages
```

A saída fica em `dist-pages`, incluindo `404.html`, `robots.txt` e `sitemap.xml`. Em Settings → Pages, selecione **GitHub Actions** como origem.

## Imagens e fontes

Os trabalhos de tatuagem e vídeos vêm do perfil público do artista. As referências e créditos estão em `docs/real-work-sources.md`, nos arquivos `public/works/*source*.json` e `public/art/*source*.json`. As licenças das fontes locais estão em `public/fonts`.
