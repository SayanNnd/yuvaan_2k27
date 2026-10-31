# YUVAAN responsive UI and decorative effects

The existing Next.js/React/Tailwind application and npm lockfile are retained. No dependencies were added. Routes, festival data, registration links, and contact flows were not changed.

## Files and tuning

| File | Responsibility / adjustments |
| --- | --- |
| `components/layout/Navbar.tsx` + `Navbar.module.css` | Reference-based navigation: Bangers/Barlow, cream mobile and inner pages, navy desktop home, lightning mark, ordered links and separate game action. Collapse below 1100 px. Bar including border: 82 px mobile, 96 px desktop. |
| `components/home/HeroSection.tsx` | `HERO_IMAGES` selects the replaceable comic artwork. `HERO_MOTION.desktop/mobile` configures extra zoom (`0.14` / `0.06`), background shift (`40` / `18` px), title shift (`16` / `8` px). Base scale is `1.04`. Zoom is greatest at the top and decreases as the hero leaves view. |
| `components/home/HeroSection.module.css` | `--comic-duration` is 85 seconds desktop / 100 seconds mobile. Increase it for slower movement. Two identical sequences, including their trailing gap, translate by half the track width. The outer depth layer owns scroll transforms. Panel widths, tint, headline sizing and safe-area spacing are also here. |
| `components/effects/PointerTrails.tsx` | `TRAIL_ASSETS` accepts local image paths. `TRAIL_SETTINGS` controls max particles, movement threshold (`distance`), lifespan in ms, and size in px. Desktop defaults: 8 / 64 / 850 / 54. Touch: 24 / 10 / 1000 / 42. Touch uses a precomputed, feathered multi-wisp fog texture with no dots or comic flecks; clouds expand, drift upward and fade over one second. Lower distance creates denser trails. |
| `public/trails/spider-mask.svg` | Local vector Spider-Man-style face created for this implementation. Replace it directly or add transparent SVG/WebP/PNG images to `TRAIL_ASSETS`. No Skiper source or Pro package is included. |
| `components/effects/useMotion.ts` | Shared pause/resume state and live OS reduced-motion preference. No animation-driven React updates. The hero pause button stops both the hero and trails. |
| `components/ui/Reveal.tsx` | Progressive section reveal. Content remains available without JavaScript, with reduced motion, or without IntersectionObserver. |
| `components/ui/GameSiteEntryModal.tsx` | Existing game information preserved, with native dialog focus trapping, Escape, scroll containment and focus restoration. The destination remains unconfigured, as before. |
| `app/layout.tsx`, `app/globals.css` | Scoped font variables, decorative canvas, skip link, visible focus, reduced-motion safeguards. |
| `next.config.ts` | Tailwind loader applies only to `globals.css`; its former `*.css` rule reclassified CSS modules and removed their class exports. |

## Artwork

The first-edition strip reuses six existing project files (`spiderman.jpg`, `dragon ball.jpg`, `batman.jpg`, `zoro.jpg`, `superman.jpg`, `vagabond.jpg`) as replaceable artwork. No external placeholder was downloaded. Next Image generates appropriately sized optimized images. Change `HERO_IMAGES` for final art; leave enough panels to cover the viewport, and keep both sequences identical. All hero artwork and the trails are decorative and hidden from assistive technology.

The supplied mobile reference is a navigation guide, not a complete mobile homepage. The navigation follows it; the mobile hero composition is an interpretation using the existing festival content and artwork.

The cursor behavior is an independent implementation inspired by the supplied reference: https://skiper-ui.com/v1/skiper18. It emits small character faces by distance, with delayed following and fading, and preserves the normal cursor. It runs only over the hero on a fine hovering mouse, avoiding foreground headings and controls. Mobile mist runs across pages using passive Touch Events because Pointer Events can be cancelled when native scrolling starts. Multitouch suspends emission without blocking pinch gestures. All effects clean up listeners and RAF work; the hero pauses off-screen and when hidden, and trails stop rendering when empty or hidden. Canvas DPR is capped at 1.5 (1 on devices reporting at most four logical cores).

## Verification (31 October 2026)

- Inspected the original running site at desktop and 390 px before edits; original browser console had no errors.
- Visually inspected updated 320×740, 390×844, 768×1024, 844×390 landscape, and 1440×900 layouts. No document horizontal overflow at these sizes. Landscape menu scrolls internally to keep all actions reachable.
- Compared the 390 px closed/expanded navigation to the attachment. Checked seven links in the supplied order, events route navigation, game dialog, Tab navigation, Escape and focus restoration.
- Observed desktop character trails in the browser with native mouse dragging over the hero.
- Observed horizontal motion, checked equal duplicated-sequence dimensions, and checked scroll-down transform values, return-to-top zoom, off-screen pause, and pause/resume button behavior.
- `node --test tests/decorative-effects.test.mjs`: 5 passing tests. Deterministic event/RAF doubles exercise passive listeners, reduced-motion gating, cancellation, pinch interruption, hybrid input exclusion, budgets, DPR cap, hidden-page suspension and cleanup. These are logic tests, not physical-device tests.
- Fresh browser load after the CSS-loader fix: no console errors or warnings.
- `npx --no-install tsc --noEmit`: passed.
- Targeted ESLint on all changed TypeScript/TSX and test files: passed.
- `npm run build`: passed, generating all 18 pages. The first sandboxed attempt failed to fetch fonts and left a cached Turbopack worker-port failure. A clean build cache and the required execution permissions resolved it. The existing multiple-lockfile warning remains.
- Full-project `npm run lint`: still fails on the pre-existing `app/schedule/page.tsx:72` synchronous state-in-effect error, plus the existing unused `comicStamp` warning in `components/ui/Badge.tsx:53`. The old Reveal error and hero image warning are resolved.

Remaining checks: physical iOS/Android scrolling, taps, pinch-to-zoom, touch mist appearance, real low-end frame pacing, and OS-level reduced-motion rendering. Viewport resizing is not touch-device emulation. Reduced-motion logic and CSS safeguards are implemented, but the browser interface used here does not expose media-preference emulation. No registration or contact submission was performed.

Run locally from `frontend`: `npm ci`, then `npm run dev -- --hostname 127.0.0.1`. Preview: http://127.0.0.1:3000.
