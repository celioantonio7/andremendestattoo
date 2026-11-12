# GitHub Pages com todas as interações

O build para Pages pré-renderiza o conteúdo para SEO e hidrata a mesma aplicação React. Carrosséis, shaders, menus, rolagem, arraste, lightboxes, vídeos locais e agendamento continuam funcionando no navegador. Não há backend, login ou formulário que dependa de servidor neste portfólio.

1. Coloque este projeto no repositório de destino, na branch `main`.
2. Em Settings → Pages, selecione GitHub Actions como origem.
3. O workflow `.github/workflows/pages.yml` usa o endereço e o caminho reais retornados pelo GitHub; publica `dist-pages`.

Para testar manualmente, informe a URL HTTPS completa e o caminho correspondente:

```sh
VITE_SITE_URL=https://CONTA.github.io/REPOSITORIO PAGES_BASE=/REPOSITORIO/ npm run build:pages
```

Para um repositório `CONTA.github.io`, use `PAGES_BASE=/`. Para domínio próprio, altere a configuração do Pages e confirme a URL antes de gerar o build.

O build contém HTML completo, canonical, Open Graph/Twitter, capa de compartilhamento, JSON-LD com identidade real, robots.txt e sitemap.xml. Por ser uma página única, o sitemap contém apenas a URL inicial; as âncoras das seções não são páginas independentes. A URL definitiva será aplicada pelo workflow, sem inventar um domínio de produção.

Não há scripts, telemetria, plugin de build ou marca da Lovable na aplicação. O histórico de projeto existente não foi reescrito.
