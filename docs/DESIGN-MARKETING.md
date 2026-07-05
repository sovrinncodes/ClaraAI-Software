# Clara AI — Marketing Site Design System (as-built)

Scope: public, unauthenticated surfaces — `app/page.tsx` (landing) and the `(marketing)` route group (`/pricing`, `/demo`, `/product`, `/solutions`, `/about`, `/contact`, `/blog`, `/security`, `/privacy`, `/terms`, `/cookies`).

This documents what is actually implemented today, not the original CLAUDE.md spec — use it as the reference when building new marketing pages or components so they stay visually consistent with the landing page.

---

## 1. Visual Direction

**"Terminal / ASCII HUD."** Pure black background, monospace type throughout, thin white hairline borders, corner-bracket frame accents, uppercase tracked labels, and a single signal accent colour (`#00D4AA`). Reads like a system diagnostics overlay, not a SaaS brochure site — closer to a HUD or CLI than to Linear/Stripe-style marketing.

This is a deliberately different aesthetic from the authenticated dashboard (see `DESIGN-DASHBOARD.md`). The dashboard uses card surfaces and a layered dark-slate palette; marketing uses flat black with hairline borders and bracket ornamentation. Do not blend the two.

## 2. Colour

| Token | Value | Usage |
|---|---|---|
| Background | `#000000` (`bg-black`) | Every section background |
| Primary text | `#E4EAF3` | Body copy (via `text-[#E4EAF3]` on root) |
| Muted text | `#8B96A8` | Secondary copy, descriptions |
| Faint text | `#5A6478` | Tertiary labels, de-emphasized captions |
| Accent | `#00D4AA` (teal) | Headlines highlight word, links, active states, borders, dots, glow lines |
| Borders | `white/5`, `white/10`, `white/20`, `white/30` (opacity steps) | Hairline dividers and corner brackets — never a solid grey border color |

There is no secondary accent on marketing pages — teal is the only colour besides white/black/greys. Status colours (`status-optimal/watch/advisory/critical`) from the dashboard token set do not appear here.

## 3. Typography

- **Everything is monospace** (`font-mono`, Geist Mono) — headlines, nav, body, buttons, labels. This is the single biggest departure from the dashboard, where body/UI chrome uses Geist Sans and only numerics/IDs use mono.
- Headlines: bold, uppercase, wide tracking (`tracking-wider`, explicit `letterSpacing: '0.08em'`), e.g. `PREDICT FAILURES` / `7 DAYS EARLY.`
- Section eyebrows: `text-[10px]` teal, `uppercase tracking-widest`, often boxed in a bordered pill (`border border-[#00D4AA]/30 bg-[#00D4AA]/5 px-3 py-1`).
- Body copy: `text-xs` to `text-sm`, `uppercase` in most feature/description contexts, `opacity-80` on the hero paragraph (mixed-case, not uppercase, for readability).
- Wordmark: `CLARA` + `<span className="text-[#00D4AA]">AI</span>`, `italic`, `-skew-x-12` (nav) or `-skew-x-6` (footer), bold, widest tracking.

## 4. Motion

All landing-page motion is centralized in `components/ui/motion-wrappers.tsx` (Framer Motion) — reuse these wrappers rather than inlining new `motion.div`s:

| Wrapper | Purpose |
|---|---|
| `HeroReveal` | Staggered hero element entrance (used with incrementing `delay` props) |
| `GlitchTitle` | Section headline entrance with a blur/glitch feel |
| `Reveal` | Generic scroll-triggered reveal, `variant="left" \| "right" \| "scale"` |
| `Stagger` / `StaggerChild` | Parent/child stagger groups for grids (`variant="up" \| "left" \| "right" \| "scale" \| "flip"`) |
| `AnimatedCounter` | Counts up to a target numeric/string stat (e.g. `78.4`, `7+`) |
| `NavReveal` | Nav bar entrance |
| `ScanLine` | Decorative horizontal scan-line sweep, dropped into section backgrounds |

A `usePreloaderDone()` hook (`components/ui/preloader.tsx`) gates the hero background image fade-in so it doesn't pop in before the preloader finishes.

**Rule:** background image/gif and section reveals fade in only after the preloader signals done — new full-page sections should respect this gate if they sit above the fold.

## 5. Layout Chrome / Ornamentation

These are the recurring motifs — apply them to keep new sections on-brand:

- **Corner brackets**: small absolutely-positioned `border-t border-l` / `border-b border-r` divs (2–3px, `border-white/10` → `border-[#00D4AA]` on hover) at the four corners of cards, images, and fixed viewport corners.
- **Hairline section accents**: a short `w-8 h-px bg-[#00D4AA]` line paired with a numbered/labelled tag (`SYSTEM_INIT_001`, `MODEL_DIRECTORY`, `STAGE_01`) and a flex-1 divider line — the "technical annotation" pattern used above nearly every section heading.
- **Dither pattern**: `.dither-pattern` utility class (repeating 1px diagonal hairline gradient, defined in `app/globals.css`) used as a vertical accent bar next to headlines and as horizontal strips between sections.
- **Grayscale-to-colour image treatment**: field/reference imagery (`filter grayscale contrast-125 group-hover:grayscale-0`) with a bottom-right `Ref: LABEL_0N` mono caption overlay — used for the "deployed in the field" strip and ESG image.
- **Bracket buttons**: primary CTA buttons are transparent with a `border border-[#00D4AA]`, filling solid teal with black text on hover; secondary buttons use `border-white/30` → `border-white hover:bg-white/5`. Small corner-accent spans (opacity 0 → 100 on hover) are layered onto the primary CTA only.
- **Frame counters / status footer**: bottom-fixed bar with `SYS.ACT`, `V1.0.0`, pulsing dot triplet, `FRAME: ∞` (static, not a live counter — a prior animated frame counter was removed because its 80ms interval re-rendered the whole page).

## 6. Section Inventory (landing page, `app/page.tsx`)

In order: fixed nav → hero → stats grid (4-up) → feature grid (6 cards, `FeatureCard`) → 10-model matrix (2-col, `MODEL_MATRIX`) → pipeline steps (5-step vertical list, `PIPELINE`) → field imagery strip (3 images) → ESG two-column (copy + live "ESG Insight Score" panel mock) → CTA section → `FlickeringFooter`.

Reuse this section order/spacing rhythm (`py-16` to `py-24`, alternating `bg-black` with `border-y border-white/10` dividers) for new marketing pages so they read as part of the same site.

## 7. Footer

`components/ui/flickering-footer.tsx` — 4-column link grid (Product / Solutions / Company / Legal) over a brand row, plus a canvas-based `FlickeringGrid` banner at the very bottom that renders the text "ESG INTELLIGENCE LAYER" as an animated dot-matrix (HTML canvas, 30fps, teal dots, flicker chance 0.06). This is a decorative, expensive-ish canvas animation — keep it isolated to the footer, don't reuse the canvas approach elsewhere without a perf pass.

Copyright line reads "Sovrinn Ltd." (the CPT legal entity name used in the footer — confirm before changing).

## 8. Content Policy — read before writing marketing copy

Per project memory (`2026-07-02` sanitization pass), marketing pages must **never** mention:
- AWS service names (SageMaker, Lambda, Timestream, AppSync, IoT Core, Cognito)
- ML algorithm/technical names (LSTM, CNN, Isolation Forest, etc.) — only the 10 user-facing model names from `CLAUDE.md` §7 (Failure Forecast, Fault Type Identifier, Energy Baseline, Energy Waste Detector, Sound Health Monitor, Safe Operating Range, Clara AI Insights, PUE Optimiser, Hot Spot Tracker, Power Quality Guard)
- Database/RLS/SQL internals
- "synthetic," "replay engine," or "investor" wording (the PoC nature is intentionally invisible to visitors)
- Monnit (that's Atlantis SEZ pilot hardware — a separate, unrelated codebase)

## 9. Component Reuse

| Need | Use |
|---|---|
| Standalone full-viewport hero (not the landing page itself) | `components/ui/hero-ascii.tsx` |
| Scroll reveals / stagger grids | `components/ui/motion-wrappers.tsx` |
| Preloader gating | `components/ui/preloader.tsx` (`usePreloaderDone()`) |
| Footer | `components/ui/flickering-footer.tsx` |
| Feature card | Inline `FeatureCard` in `app/page.tsx` (not yet extracted to `components/ui`) |

If a second page needs the feature-card or model-matrix-card pattern, extract it to `components/ui/` rather than duplicating the JSX.
