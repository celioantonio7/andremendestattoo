# André Mendes Cinematic Implementation Plan

**Goal:** Implement the approved six-section interactive artistic portfolio.
**Architecture:** React sections with shared tilted artwork cards and accessible Radix lightbox. Client-only scoped GSAP timelines and one lazy WebGL atmosphere. Embla owns carousel track transforms; inner card wrappers own hover transforms.
**Tech Stack:** Existing React 19 / TanStack / Vite, GSAP, Embla, WebGL, CSS.
**Spec:** docs/superpowers/specs/2026-11-12-andre-cinematic-design.md

## Global Constraints
- Preserve the supplied portrait identity and use only in hero.
- Warm black/red/amber palette; no blue/cyan.
- Original reference compositions guide geometry; no flat full-section PNG backgrounds.
- No invented projects, artist biography, contact details or external destinations.
- Support mobile, reduced motion, keyboard and graceful WebGL failure.

## Review Focus
- Autoplay stops when focus, pointer interaction or hidden document requires it.
- Lightbox supports Escape, arrows, focus trapping and return focus.
- Missing contact config never redirects to a fictional phone number.
- Mobile remains readable without horizontal document overflow.
- Reduced motion and WebGL failure retain all content.

### Task 1: Assets and content
- [x] Prepare portrait cutout and independent engraving artwork; optimize into public/art.
- [x] Define artwork content with accurate illustration labels and no invented project facts.

### Task 2: Interactive page
- [x] Replace old Dark House route with six André Mendes sections and responsive CSS.
- [x] Implement Embla carousel, pause/resume controls and accessible lightbox.
- [x] Implement configured contact links or briefing-copy fallback.
- [x] Test lightbox navigation and contact behavior.

### Task 3: Motion
- [x] Scope hero timeline, individual reveals, sticky stacking, parallax and SVG draw to the page.
- [x] Add pointer glints and magnetic CTA with separate transform ownership.
- [x] Add lazy WebGL smoke, CSS fallback, visibility pause and disposal.

### Task 4: Verification
- [x] Run Vitest, TypeScript, ESLint and production build.
- [x] Inspect desktop/mobile screenshots and exercise carousel, lightbox, contact, reduced motion and WebGL fallback in browser.
- [x] Report visual differences and missing external booking configuration explicitly.

## Refinamentos pedidos durante a implementação

Implementados: ciano discreto aprovado pelo usuário; navegação fixa que desaparece ao descer e reaparece ao subir; WhatsApp SVG transparente arrastável, com teclado e supressão de clique após drag; AM transparente no header e no favicon PNG/ICO/Apple; preloader com progresso de recursos reais e saída garantida, sincronizado à timeline da hero; entrada em profundidade na galeria.

HappyCash analisada ao vivo; faixas diagonais e footer expansível documentados como propostas em docs/happycash-reference.md, para debate com o usuário. Canal de WhatsApp do André continua dependendo do número real.
