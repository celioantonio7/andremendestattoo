# Verificação local

- `npm run dev`: inicia a prévia local; a instância desta sessão está em http://localhost:8080.
- `npm test`: rota e invariantes das seis seções, fontes reais e fechamento cinematográfico.
- `npx tsc --noEmit`: tipos.
- `npm run lint`: qualidade e formatação; os seis avisos existentes estão nos componentes genéricos de UI.
- `npm run build`: bundle cliente/SSR/Cloudflare.
- `npx playwright install chromium`: prepara o navegador.

Com a prévia rodando:

- `node scripts/check-portfolio.mjs`: shader, carrossel, galeria, teclado, foco, breakpoints, menu, briefing, reduced motion e fallback WebGL.
- `node scripts/check-floating-controls.mjs`: menu por direção do scroll e WhatsApp arrastável/teclado.
- `node scripts/check-preloader.mjs`: preloader e recuperação de falha de imagem.
- `node scripts/check-cinematic.mjs`: abertura fotográfica/final AM, favicon transparente, vídeos reais, Dive-in, footer expansível, mobile e reduced motion.

Capturas em `/tmp/andre-check`. Fontes de trabalhos e vídeos em `docs/real-work-sources.md` e `public/works/sources.json`.

O WhatsApp está configurado com o contato verificado no Instagram; `VITE_BOOKING_URL` pode substituí-lo. O favicon usa PNG/ICO com transparência; a imagem PNG foi exportada a 256 px para manter a nitidez em tamanhos pequenos.

O retrato e os trabalhos reais diferem dos PNGs conceituais originais; portanto a implementação não é uma cópia pixel a pixel. As três ilustrações de Estilos ainda seguem as referências conceituais. Fluidez em hardware móvel físico não foi medida.

## Ajustes conferidos em 12/11/2026

- Hero: parede de trabalhos decorativa, sem clique ou arraste; troca a cada 1,2 s e pausa ao passar o mouse. Lettering centralizado abaixo do rosto, RGB da foto fornecida preservado em WebP sem perdas, transparência e espaço superior recortado.
- Sobre: composição deslocada à esquerda e máscara suave sem borda retangular; cinco cards com empilhamento no desktop.
- Processo: surgimento de baixo para cima vinculado à rolagem, reversível ao subir.
- WhatsApp: verde original, símbolo branco, flutuação leve e posição arrastável.
- Footer: faixas com ciclo de 12 s, aceleração ao descer e desaceleração gradual; painel sem rolagem interna em 1440×900, 768×700, 390×844 e 390×667; AM mais alto e ícones Lucide maiores.
- Fumaça: movimento e densidade aumentados, mantendo as cores existentes e a camada abaixo das fotos.
- Fotos: work-1 usa quadro real de 720×1280 do vídeo original; work-2 usa a maior capa pública disponível (720×1280). Dive preserva o enquadramento vertical e limita o zoom; não inventa detalhes ausentes da fonte.
- `node scripts/check-refinements.mjs`: comportamento e encaixe desses ajustes.

## Fundos e enquadramento da referência

A hero recebeu escultura e máscara como imagens de cenário nas laterais, arco atrás do retrato, lettering central em duas linhas e cards com alturas alternadas. Todas as seis seções têm uma camada de ilustrações ao fundo, sem interação. A paleta existente foi mantida. A altura mínima de 830 px foi removida da hero para caber na área útil do navegador; o retrato e o botão são conferidos por limites de viewport.

A exportação do recorte intercala explicitamente RGB da foto original com a máscara alfa, preservando a pele e eliminando áreas de fundo opacas. `scripts/check-scenery.mjs` abre a porta 8081, verifica transparência nas bordas, fundos carregados, ausência de corte do botão, posição do rosto e navegação, e captura as seções em `/tmp/andre-check/scenery-*.png`.

O processo agora usa um pin do ScrollTrigger durante a apresentação dos quatro cards, com tempo de leitura no último antes da liberação. No celular, a rolagem vertical percorre os cards horizontalmente dentro da seção fixa. Rolagem inversa reverte a sequência; reduced motion mantém o fluxo normal. `node scripts/check-process-pin.mjs` verifica fixação, último card visível, liberação e reversão em desktop e mobile.

Hero: trilho em diagonal de 12° com mouse/touch, mantendo autoplay e pausa; chamada, botão e estilos agora formam uma única coluna com espaçamento explícito. Dive começa com a primeira foto inteira, antes de revelar a segunda. Faixas não dependem mais do estado do painel para rodar. Painel aberto monta seu próprio shader com intensidade maior. `node scripts/check-hero-footer-fixes.mjs` verifica arraste de mouse, swipe por eventos de toque, espaçamentos, máscaras, autoplay das faixas antes do painel e canvas ativo no modal.

## Refinos de navegação e abertura

- Preloader mede o logo do cabeçalho e leva o AM central até essa posição com escala uniforme; o header não some ao concluir.
- Menu mobile usa diálogo acessível, palavras grandes centralizadas e troca vertical de texto, inspirado na prévia pública de https://21st.dev/@koustubhayadiyala36/components/animated-menu. Implementação própria com Radix e CSS.
- Referências públicas de https://motionlab.one/categories/scroll: leitura progressiva por palavras no Sobre, entrada em perspectiva nos estilos, parallax no contato. Foram preservados Dive-in, pin do processo e faixas por velocidade. Não foram acessados códigos exclusivos para assinantes.
- Removidos contadores de seção, setas laterais e play/pause da hero. Indicadores, autoplay, hover e arraste continuam ativos.
- Ícone de brilhos trocado por pincel; trilho social aponta para Instagram, WhatsApp e vídeos reais do site.
- Último card do Sobre usa altura e deslocamento compatíveis com a viewport, com espaço de rolagem após o encaixe.
- `node scripts/check-menu-docking.mjs`: voo do logo, controles removidos, contadores, encaixe e menu mobile.
