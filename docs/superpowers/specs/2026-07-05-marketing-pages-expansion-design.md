# Marketing Pages Expansion — Design Spec

**Date:** 2026-07-05
**Status:** Approved by user, ready for implementation planning

## Problem

Every marketing page except the home page (`app/page.tsx`) is thin relative to the visual/content depth established on home — most are under 130 lines with 3-4 static content blocks and no interactivity beyond what already existed (Solutions' vertical tabs, Product's code-tab switcher). Specifically:

- Pricing's FAQ is 5 always-expanded `<div>` blocks, not an accordion, with no comparison table.
- Contact's form doesn't submit anywhere (`action="#"`).
- Blog's 4 post cards link to `#` — there are no real post pages.
- About, Security have a handful of static bordered cards and nothing else.

This spec covers expanding all `(marketing)` route group pages except `demo` (already judged adequate) to match the home page's depth, using the existing terminal/HUD design system documented in `docs/DESIGN-MARKETING.md`.

## Approach

Build a small set of shared components once, then apply them consistently, rather than duplicating one-off markup per page (e.g. two separate accordion implementations for Pricing and Security FAQs). All new components follow `DESIGN-MARKETING.md`: black background, mono type, corner-bracket accents, `#00D4AA` as the only accent, `Reveal`/`Stagger`/`GlitchTitle` from `components/ui/motion-wrappers.tsx` for entrance animation.

## New Shared Components

### `components/ui/accordion.tsx`
Single-open or independently-toggleable Q&A rows matching the existing FAQ card look (bordered, corner brackets appearing on hover/open, mono uppercase question). Chevron rotates on expand. Used by Pricing FAQ and the new Security FAQ.

**Interface:**
```tsx
interface AccordionItem { q: string; a: string }
interface AccordionProps {
  items: AccordionItem[]
  allowMultipleOpen?: boolean // default false — one open at a time
}
```

### `components/ui/comparison-table.tsx`
Row-per-feature, column-per-tier (or column-per-approach) table styled with the same hairline borders and mono type as the rest of the site. Used by:
- Pricing: Starter / Professional / Enterprise feature matrix.
- Solutions: 2-column "Reactive maintenance vs Clara AI" comparison.

**Interface:**
```tsx
interface ComparisonTableProps {
  columns: string[]                 // e.g. ['Starter', 'Professional', 'Enterprise']
  rows: { label: string; values: (string | boolean)[] }[] // boolean renders check/dash
}
```

### `components/ui/timeline.tsx`
Vertical stepped list in the terminal-log aesthetic (e.g. `2025.03 — SYSTEM_INIT`), each entry with a date/tag, title, and description. Used by About's milestones section.

**Interface:**
```tsx
interface TimelineEntry { date: string; tag: string; title: string; description: string }
interface TimelineProps { entries: TimelineEntry[] }
```

### `components/ui/stats-strip.tsx`
Extraction of the homepage's 4-up `AnimatedCounter` stat grid (`app/page.tsx` lines 159-177) into a reusable component, parameterized by the stat list. Used by About; homepage itself can optionally be refactored to consume it (not required for this spec, low priority).

**Interface:**
```tsx
interface Stat { value: string; label: string }
interface StatsStripProps { stats: Stat[] }
```

## Page-by-Page Scope

### Product (`app/(marketing)/product/page.tsx`)
Add, after the existing ingestion/security sections and before the CTA:
1. **10 Models deep-dive grid** — a full grid of all 10 Clara AI models (name, icon, "watches" / "tells you" copy, primary UI surface), reusing the `MODEL_MATRIX` data shape already defined in `app/page.tsx` (extend it with an `icon` and `uiSurface` field, move to `lib/data/models.ts` so home and Product both import it instead of home keeping its own private copy).
2. **Integrations & compatibility** — a bordered panel listing supported ingestion protocols (BACnet, Modbus, MQTT, REST/webhook) and the "no proprietary hardware required" message already present in the ingestion section, expanded into a proper list with short descriptions per protocol.

### Solutions (`app/(marketing)/solutions/page.tsx`)
Add, after the existing "Core Technical Advantages" 3-card grid and before the CTA:
1. **Outcome/case-study strip** — one quantified-outcome card per vertical (4 cards, one per `VERTICALS` entry), e.g. data centre → "15% cooling cost reduction," manufacturing → "Prevented catastrophic bearing failure 45 days out." Ties to the same kind of stat already used on home and in the existing blog teaser copy ("Reducing Cooling Costs by 15% in Johannesburg") — reuse that specific claim rather than inventing a new one, to stay internally consistent.
2. **Reactive vs predictive comparison** — a 2-column `ComparisonTable` (Reactive Maintenance vs Clara AI) covering dimensions like Downtime, Alert Lead Time, ESG Reporting Effort, Energy Waste Detection.

### Pricing (`app/(marketing)/pricing/page.tsx`)
1. **FAQ → Accordion + more questions** — replace the current flat `FAQS.map` block with `<Accordion items={FAQS} />`. Expand `FAQS` from 5 to ~12 entries, adding: annual vs monthly billing, plan change/upgrade process, cancellation/notice period, what happens to historical data on downgrade, hardware/sensor cost (clarify Clara doesn't sell hardware), whether multiple currencies are supported (ZAR-only for now), difference in model coverage between Starter and Professional, dedicated support responsiveness per tier, whether the Enterprise custom-model timeline is negotiable.
2. **Feature comparison table** — insert a `ComparisonTable` between the plan cards and the FAQ section, one row per capability (e.g. "Facilities," "Monitored assets," each of the 10 models as its own boolean row or grouped as "All 10 models," "ESG reporting," "API access," "SLA") across the 3 plan columns — this becomes the canonical source that the existing `PLANS[].features` arrays should stay consistent with (not deleted; the cards keep their bullet summaries, the table adds the side-by-side view).
3. **Annual billing toggle** — a monthly/annual switch above the plan cards; annual price computed as `monthly * 10` (2 months free) and displayed with a small "billed annually" note. Purely a display-layer toggle — no billing/payment integration exists yet, so this only changes the displayed price and period label.
4. **Add-ons / usage pricing** — a small panel below the plan grid listing à la carte line items: extra facility beyond plan limit, extra data retention per month, dedicated model capacity (Enterprise-adjacent) — static pricing table, no calculator logic.

### About (`app/(marketing)/about/page.tsx`)
Add, after the existing mission/team grid and before (or replacing the position of) the "Backed by Sovrinn" box:
1. **Company timeline/milestones** — `Timeline` component with entries like `2025.03 — SYSTEM_INIT` (founding), `2025.11 — FIRST_PILOT_DC` (first pilot deployment), `2026.05 — 10_MODELS_LIVE` (full model suite live), `2026.07 — CLARA_2_0` (ties to the blog's "Clara AI 2.0" post date so the two pages agree on the platform's timeline).
2. **Values / operating principles** — 4 short principle cards reusing the home page's `FeatureCard`-style bordered-card-with-corner-brackets pattern: "Predictive over reactive," "Isolation by default," "ESG is an outcome, not a report," "Built for critical infrastructure."
3. **Stats strip** — `StatsStrip` with entries like `4` / "Verticals Supported", `10` / "AI Models", `24/7` / "Continuous Monitoring", `ZA` / "Headquartered, Global Reach".

Leadership/team grid was intentionally excluded (no real name/role content to publish yet).

### Contact (`app/(marketing)/contact/page.tsx`)
1. **Wire the form to `/api/contact`** — new route handler:
   - Zod schema: `{ name: string (min 1), email: string email, category: 'sales' | 'support', message: string (min 1) }`.
   - Validates, logs the submission server-side (`console.log` with a structured object — no email/SES send, per prior decision), returns `{ success: true }` or `{ success: false, error }`.
   - Frontend: form becomes a client component with local submit state (idle/submitting/success/error), replacing the current bare `<form action="#">`.
2. **Sales vs support routing** — two toggle buttons above the form ("Talk to Sales" / "Get Support") that set the hidden `category` field; the selected button highlights in the same active-tab style already used on Solutions' vertical tabs.
3. **Support SLA note** — small panel near the contact-info cards: "Standard: 1 business day · Priority (Professional): 4 hours · Enterprise: 1 hour + dedicated Slack" — sourced from the same tier names used on Pricing.
4. **Coverage badge row** — a small pill row under the header: "Johannesburg HQ" / "Cape Town Data Region" / "Operating Globally", reusing the existing bordered-pill pattern (e.g. the "30-DAY FREE TRIAL" pill on Pricing).

### Blog (`app/(marketing)/blog/[slug]/page.tsx` — new) + list page
1. **Static data source** — new `lib/data/blog.ts`:
   ```ts
   interface BlogPostSection { heading?: string; paragraphs: string[] }
   interface BlogPost {
     slug: string
     date: string        // '2026-07-01'
     category: 'PRODUCT' | 'INDUSTRY' | 'ENGINEERING' | 'CASE STUDY'
     title: string
     excerpt: string
     body: BlogPostSection[]
   }
   export const BLOG_POSTS: BlogPost[]
   ```
   Migrate the 4 existing hardcoded post teasers into this array, each with 3-5 body sections of real paragraph content (written as part of implementation, not placeholder).
2. **Detail route** — `app/(marketing)/blog/[slug]/page.tsx` renders the full post (same nav/footer chrome as other marketing pages), 404s via `notFound()` if the slug isn't found, includes a "back to blog" link and previous/next post navigation.
3. **Category filter** — pill/tab row above the post grid on the list page, filtering client-side by the `category` field already present in the data.
4. **Featured post** — the most recent post (`BLOG_POSTS[0]` after sorting by date) renders as a large hero-style card above the regular grid; the grid excludes it to avoid duplication.
5. **Newsletter signup** — email-capture strip at the bottom of the list page, posting to a new `/api/newsletter` route with the same validate-and-log-only pattern as `/api/contact` (no ESP integration yet).

### Security (`app/(marketing)/security/page.tsx`)
Add, after the existing 4-card grid and before the footer:
1. **Security FAQ (accordion)** — `<Accordion items={SECURITY_FAQS} />` with ~5 questions: bug bounty program, data deletion process on offboarding, self-hosting/on-premise availability (ties to the Enterprise plan's "on-premise deployment available" feature already listed on Pricing), penetration testing cadence, sub-processor disclosure.
2. **Data retention & deletion policy** — a small table: telemetry retention per plan tier (references the 30-day/1-year/unlimited figures already stated per-plan on Pricing), what happens to data after contract termination (matches the "14 days read-only then archived" language already on the Pricing FAQ).
3. **Trust center panel** — 3 buttons ("Request SOC 2 Report," "Request DPA," "Request Sub-processor List") that route to `/contact?category=support` with a pre-filled message template — no real document hosting/gating system, just routes the request through the now-functional contact form.
4. **Incident response blurb** — short paragraph describing the incident response process, plus a status-page link. Since no status page exists yet, this links to `/contact` instead of a placeholder external URL (avoids linking to a non-existent page).

### Legal pages (Privacy, Terms, Cookies)
Same treatment applied to all three (`app/(marketing)/privacy/page.tsx`, `terms/page.tsx`, `cookies/page.tsx`):
1. **Table of contents** — anchor-linked list at the top in the terminal-label style (e.g. `[ 01_DATA_COLLECTION ]`, `[ 02_DATA_USE ]`), linking to `id`-anchored sections below.
2. **Effective-date/version header** — small metadata line under the H1: "Effective: 2026-07-05 · Version 1.1".
3. **Deeper sub-clauses**, per page:
   - **Privacy:** what's collected per category (account data, telemetry metadata, usage analytics), retention per category, POPIA/GDPR user-rights section (access/deletion/portability requests — routed through `/contact`).
   - **Terms:** acceptable use, service availability/liability limitation, termination conditions, governing law (South Africa).
   - **Cookies:** an actual table of cookie names/purpose/duration (even if today it's just the auth session cookie and no third-party trackers — state that plainly rather than inventing cookies that don't exist).

## Data Flow / New Files Summary

| File | Purpose |
|---|---|
| `components/ui/accordion.tsx` | Shared FAQ accordion (Pricing, Security) |
| `components/ui/comparison-table.tsx` | Shared comparison table (Pricing, Solutions) |
| `components/ui/timeline.tsx` | Shared milestone timeline (About) |
| `components/ui/stats-strip.tsx` | Shared stat grid (About) |
| `lib/data/models.ts` | Extracted `MODEL_MATRIX` (shared by home + Product) |
| `lib/data/blog.ts` | Blog post data + types |
| `app/(marketing)/blog/[slug]/page.tsx` | Blog post detail route |
| `app/api/contact/route.ts` | Contact form submission handler (Zod validate + log) |
| `app/api/newsletter/route.ts` | Newsletter signup handler (Zod validate + log) |

No Prisma schema changes, no new dependencies — accordion/table/timeline are built from scratch with plain React state + Tailwind, consistent with how `Tabs`-like interactivity is already hand-rolled on Solutions/Product (no headless-UI library is currently in use for this pattern).

## Explicitly Out of Scope
- Actual email sending (SES) for contact form and newsletter — logged only, per earlier decision; swapping in SES later requires no frontend changes.
- Blog CMS/MDX — content lives in a static TS array, not markdown files.
- Payment/billing integration for the annual pricing toggle — display-only.
- Leadership/team bios on About — no content to publish yet.
- Any changes to the `demo` page — already judged adequate.
- Refactoring the homepage to consume the new shared components — optional future cleanup, not required by this spec.
