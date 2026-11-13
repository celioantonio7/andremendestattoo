# Trabalhos reais e referências de movimento

Perfil examinado sem login em 12/11/2026: https://www.instagram.com/andremndes/ . O artista identifica SJC/SP e informa `https://wa.me/5512997389289` como canal de orçamento. O site usa esse contato, com possibilidade de substituição por `VITE_BOOKING_URL`.

As oito imagens de `public/works/` são registros/capas publicados no perfil. Os nomes usados no site descrevem elementos visíveis, sem inventar significados, datas ou informações sobre clientes. A correspondência completa entre imagem e publicação está em `public/works/sources.json`.

Vídeos locais, importados a partir de mídia pública reproduzida na página de origem:

- `public/works/reel-1.mp4`: https://www.instagram.com/andremndes/reel/DenNyKjJeI0/ — 58,37 s, 720 × 1280, H.264 + AAC.
- `public/works/reel-2.mp4`: https://www.instagram.com/andremndes/reel/DeXf_LYp2R_/ — 33,53 s, 720 × 1280, H.264 + AAC.

Os vídeos são carregados somente quando o visitante abre o player. Não há autoplay com áudio. Há link para a publicação original tanto nos vídeos quanto no lightbox de imagens. Capas preservam marcas/lettering existentes.

A hero e a galeria agora usam esses trabalhos reais. As três ilustrações da seção Estilos continuam sendo artes conceituais de apresentação, conforme as referências visuais originais.

## Movimento

- Realevate: https://github.com/Animmaster/Realevate-Landing-Page-/blob/main/script.js — estudo da sequência de fotos que se revelam por máscaras, zoom interno e contador. Implementação React própria, com progresso dos recursos reais e final no AM transparente.
- Dive-in: https://github.com/Animmaster/Dive-in-effect/blob/main/script.js — estudo da expansão de imagens centrais durante scroll e entrada do texto em perspectiva. Adaptado para um trecho dentro da galeria, com três fotos reais e alternativa estática para reduced motion.
- HappyCash: https://www.happycashsite.com.br/ — faixas diagonais e painel expansível de footer adaptados à linguagem André Mendes e a links reais.

Não foram usados assets dos demos. A fumaça WebGL, grão e luz ambiente permanecem abaixo do conteúdo; a paleta do fundo foi ampliada sem colocar um véu sobre fotos ou textos. Favicon PNG/ICO e logo mantêm transparência.

Qualidade revisada: `work-1.webp` foi extraído aos 2 s do reel original, em 720×1280, mantendo a marca existente; `work-2.webp` foi reimportado do candidato público em 720×1280. O zoom do Dive foi reduzido e as fotos verticais usam contain para evitar ampliação excessiva.

## Galeria cinematográfica (12/11/2026)

Foram adicionados seis MP4 públicos do mesmo perfil, totalizando oito vídeos locais. As associações entre arquivo e publicação estão em `public/works/sources.json`. Todos os oito arquivos passaram pelo ffprobe; a reprodução do player foi verificada no navegador.

- Cilindro de cards: interpretação em DOM/CSS 3D da primeira experiência de https://tympanus.net/Tutorials/Cinematic3DScroll/, com rotação controlada pelo scroll, posters estáticos e player individual. Só os cards voltados à câmera ficam clicáveis após a rolagem e o scrub terminarem.
- Menu: cortina SVG curva inspirada em https://tympanus.net/Sketches/022-svg-path-page-transition-horizontal/, adaptada a âncoras da mesma página.
- Passagem hero/sobre: recorte reversível ligado ao scroll, adaptando a linguagem de https://async-page-transitions.crnacura.workers.dev/alternative-page ao documento contínuo.
- Letras do footer: escala e deslocamentos opostos inspirados em https://tympanus.net/Tutorials/InfiniteScrollParallax/. O fundo e a página não fazem scroll infinito.
- Hero: Embla Auto Scroll contínuo, arraste nativo e pausa apenas ao apontar para uma imagem. A foto original recebe somente deslocamento de perspectiva pelo ponteiro.
- Ciclo de vida: IntersectionObserver e visibilidade do documento suspendem loops e shaders; overlays suspendem a página. Reduced motion apresenta a galeria como grade estática e navegação direta.

## Novos detalhes e referência do vídeo (12/11/2026)

Foram examinados oito momentos do vídeo `2026-11-12 21-04-34.mp4`: um mosaico assimétrico se abre com a rolagem até a imagem central ocupar a tela. “APROXIME O OLHAR” agora usa essa composição, com alternativas estáticas para movimento reduzido.

Novas fotos do perfil oficial, com os maiores candidatos disponíveis e WebP de alta qualidade, sem geração de detalhes artificiais:

- `detail-1.webp`: Faith, publicação `DdKgm_spUkz`, 720 × 1280.
- `detail-2.webp`: Itachi Uchiha, publicação `DdAIuouJJW4`, 1089 × 1936.
- `detail-3.webp`: Onibaba/Namakubi, publicação `Dc6LjluRHpu`, 720 × 1280.

As fontes canônicas e legendas estão em `public/works/detail-sources.json`. Nenhuma URL temporária de CDN é necessária em produção.

“TRABALHOS EM MOVIMENTO” usa uma espiral Three.js com deformação leve dos planos, adaptando o movimento de https://github.com/Hank-D-Tank/wobble-scroll/blob/main/index.html às capas e aos vídeos locais. O scroll da página continua livre, o arraste horizontal altera a espiral, o movimento para sobre uma foto e os players só abrem depois da estabilização. Há navegação por teclado, grade para movimento reduzido/falha WebGL e descarte dos recursos ao desmontar. Não são usados os assets externos do demo.

Em Sobre, o ScrollTrigger fixa a seção inteira. A escultura e seu halo não recebem parallax; os cards entram de baixo e saem por cima, sem a pilha de textos translúcidos. Legendas do portfólio ficam fora da superfície inclinada e sem lente/desfoque.
