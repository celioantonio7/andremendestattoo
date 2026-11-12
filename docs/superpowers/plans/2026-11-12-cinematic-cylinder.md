# Cinematic cylinder implementation plan

Goal: implement the approved 3D video cylinder, continuous hero, SVG navigation transitions, scroll handoff and visibility-scoped effects.

Architecture: DOM/CSS 3D tangent cards form a cylinder driven by an existing GSAP ScrollTrigger. Static real posters remain lightweight; a settled, front-facing card opens one local video. A shared activity coordinator suspends loops under modals or hidden tabs. No new 3D dependency is needed for these interactive flat cards.

- [x] Import six additional public reels, preserve canonical provenance and validate video files.
- [x] Implement continuous, draggable, diagonal hero using one transform owner and visibility/hover gates; add pointer parallax to the unchanged portrait.
- [x] Replace the two-video grid with the pinned cylinder, settle-to-click gate, keyboard traversal and reduced-motion grid.
- [x] Add a single SVG curtain for menu jumps and a reversible scroll-bound hero-to-about reveal.
- [x] Remove the small Dive subtitle; add art scenery and scoped smoke; apply lettering-only parallax and consistent footer typography.
- [x] Suspend offscreen loops, videos, CSS animations and shaders; preserve progress; pause background when a modal opens.
- [ ] Verify real media playback, cylinder gates, continuous motion, hover, touch, navigation, hidden-tab/offscreen suspension and mobile/reduced-motion; run types, lint, unit tests and production build.

## Additional polish requested

- [x] Remove hero caption and indicators; improve edition contrast.
- [x] Apply glass buttons with pointer reflection and press/hover states.
- [x] Give the portfolio continuous motion and image-only hover pause, without play/pause controls.
- [x] Use distinct artwork combinations and reversible section-specific masks, unfolding style cards and central gallery expansion.
- [x] Check desktop/mobile screenshots, navigation, glass styles, gallery motion and hover suspension with Playwright.
