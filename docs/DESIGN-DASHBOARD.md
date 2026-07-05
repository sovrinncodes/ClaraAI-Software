# Clara AI — Dashboard (Authenticated App) Design System (as-built)

Scope: authenticated surfaces under the `(app)` route group — `/dashboard`, `/facilities`, `/equipment`, `/energy`, `/esg`, `/alerts`, `/workorders`, `/settings`.

This documents what is actually implemented, not just the original CLAUDE.md spec — the two mostly agree, but this file reflects real component names, real token names, and patterns added since (workspace switcher, command palette, alert store) that weren't in the original brief.

This is a **separate visual language from the marketing site** — see `DESIGN-MARKETING.md`. The dashboard is a data-dense operational console (card surfaces, layered dark-slate palette, Geist Sans UI + Geist Mono numerics); marketing is a flat-black terminal/HUD aesthetic. Do not cross-pollinate components between them.

---

## 1. Visual Direction

"Operational Intelligence" dark theme — industrial, data-dense, technically confident. Reference points: Linear, Retool, Datadog, Bloomberg Terminal. Dark mode is the **only** mode for authenticated routes (`html { color-scheme: dark }`, no light-mode toggle). Chrome (sidebar, header) is deliberately quiet so the data is the visual centerpiece.

## 2. Design Tokens

Defined in `app/globals.css`, exposed two ways: as Tailwind v4 `@theme inline` tokens (`--color-*`, usable as `bg-[--color-bg-card]` etc.) and as plain CSS custom properties on `:root` (used directly via inline `style={{ backgroundColor: 'var(--bg-card)' }}` throughout the component tree — this is the dominant pattern in practice, not Tailwind arbitrary-value classes).

**Backgrounds** (layered, each step lighter):
```
--bg-base:     #0A0D14   body background
--bg-surface:  #111620   sidebar, header
--bg-card:     #151C2C   KPI cards, panels
--bg-elevated: #1C2438   inputs, buttons, dropdowns
--bg-hover:    #1E2840   hover state
--bg-active:   #243050   active/selected state (e.g. active sidebar item)
```

**Borders**: `--border-subtle` (white 6%), `--border-default` (white 10%) — the default for card/panel borders — `--border-strong` (white 18%) for focused/open states, `--border-accent` (#2E86AB, rarely used directly).

**Text**: `--text-primary` (#E4EAF3), `--text-secondary` (#8B96A8), `--text-muted` (#5A6478), `--text-disabled` (#3A4258).

**Accent**: `--accent-primary` (#00D4AA teal) + `--accent-primary-muted` (12% alpha) — used for active nav indicator, live-data badge, primary numeric highlights, focus rings.

**Status** (4-state only — never introduce a 5th): `--status-optimal` (teal), `--status-watch` (blue #3B82F6), `--status-advisory` (amber #F5A623), `--status-critical` (red #E5484D). Same 4 values are reused as `--positive/--negative/--warning/--info` semantically and as `--chart-1..5` (5th chart colour is violet #8B5CF6, no status equivalent).

**Radii**: `--radius-card: 10px`, `--radius-button: 6px`, `--radius-input: 4px`.

**Chrome sizing**: `--sidebar-width: 200px` (`--sidebar-width-collapsed: 56px` defined but no collapse UI implemented yet), `--header-height: 56px`.

## 3. Typography

- UI chrome (nav labels, buttons, body copy): Geist Sans, default weight, normal case except section labels.
- **All numbers, IDs, timestamps, sensor readings**: Geist Mono (`font-mono`) — this rule is followed consistently (KPI values, sync clock, workspace codes, alert badges, sparkl abels).
- KPI card labels: `text-[10px] font-medium uppercase tracking-widest`, `--text-secondary`.
- KPI card values: `font-mono text-3xl font-light`, `--text-primary`.
- Sidebar section headers (OVERVIEW / INTELLIGENCE / OPERATIONS): `text-[10px] font-semibold tracking-widest`, `--text-muted`.

## 4. Layout Shell

`app/(app)/layout.tsx`: flex row, full-height, no page scroll on the shell itself — `Sidebar` (fixed 200px) + a flex column of `Header` (56px) + `<main className="flex-1 overflow-auto p-6">`. Wrapped in `QueryProvider` (TanStack Query) and `AppTenantProvider`.

### Sidebar (`components/layout/sidebar.tsx`)
- Three nav sections (`NAV_SECTIONS`): **OVERVIEW** (Portfolio Overview, Facilities), **INTELLIGENCE** (Equipment Health, Energy Optimisation, ESG Reports), **OPERATIONS** (Alert Feed w/ live badge, Work Orders). Bottom-pinned: **Settings**.
- Active item: left-edge 2px teal pill indicator + `--bg-active` background + teal icon.
- Alert Feed badge count is live from `useAlertStore` (Zustand) `unreadCount`, capped display at `99+`.
- Wordmark: teal-tinted "C" monogram square + `Clara AI` in mono, uppercase, wide tracking (different treatment from the italic-skew marketing wordmark).

### Header (`components/layout/header.tsx`)
Left: `LastSyncIndicator` (ticks every 1s, `formatUtcTime`). Right, in order: `LiveDataBadge` (pulsing teal dot pill) → divider → `SearchButton` (opens `CommandPalette` on click or ⌘K/Ctrl+K) → `TenantSwitcher` (workspace dropdown, backed by `useWorkspaceStore`, with search-filter, active/other workspace sections, and workspace/facility count footer) → `AvatarButton`.

The `TenantSwitcher` is a fully-built workspace switcher (search, active-workspace pin, click-outside close) — this is beyond the original CLAUDE.md spec's simple "tenant switcher" and should be treated as the canonical pattern for any future multi-select dropdown in the header.

## 5. Component Patterns

### KPI Card (`components/dashboard/kpi-cards.tsx`)
Shared internal `KpiCard` primitive: `bg-card` surface, `10px` radius, `border-default` border, `p-5`. Structure top→bottom: uppercase label + icon (muted) → mono value (3xl, light weight) → trend row (`TrendArrow`: green `TrendingUp` / red `TrendingDown` + signed one-decimal value) + trend label → optional `footer` slot (used by Active Alerts for the critical/advisory dot-breakdown) → optional `Sparkline` (32px tall, colour passed per-card: optimal teal, advisory amber, chart-4 blue, critical red).

Four instances on the dashboard: `EsgScoreCard`, `PortfolioHealthCard`, `EnergyOptimisedCard`, `ActiveAlertsCard`. New KPI cards should compose the same internal `KpiCard`, not a new one-off.

### Status Badge (`components/shared/status-badge.tsx`)
Maps the 4-state `FacilityStatus` enum (`OPTIMAL | WATCH | ADVISORY | CRITICAL`) to a `{dot, text, bg, border}` variant set using Tailwind's built-in `green/blue/amber/red` palettes at `/10` bg and `/20` border opacity (note: not the raw `--status-*` hex tokens for the Tailwind classes — those are only used for the dot via `bg-[--status-*]`). Two sizes: `sm` (10px text) and `md` (default, 12px). This is the canonical status-badge component — use it everywhere a facility/asset/alert status renders instead of hand-rolling badge markup.

### Dashboard Page Composition (`app/(app)/dashboard/page.tsx`)
Top→bottom: conditional `CriticalAlertBanner` (only rendered when a `CRITICAL` + `ACTIVE` alert exists in `DEMO_ALERTS`) → 4-up KPI row (responsive `grid-cols-1 sm:2 lg:4`) → main content in a `lg:grid-cols-4` split: left 3/4 column stacks `TelemetryOverviewChart` → `FacilityGrid` → `AssetWatchlist`; right 1/4 column is a sticky (`lg:sticky lg:top-6`) `LiveAlertFeed`.

## 6. Charts

Recharts is the default; ECharts is reserved for FFT spectrum / complex visualizations (equipment detail). Global Recharts defaults live in `app/globals.css`: grid lines at `rgba(255,255,255,0.05)`, axis/tick text in `--text-muted` at 11px mono, no custom tooltip outline. `components/charts/sparkline.tsx` is the shared mini-chart used inside KPI cards (accepts `data`, `color`, `height`).

Chart colour order for multi-series charts: `--chart-1` (teal) → `--chart-2` (amber) → `--chart-3` (red) → `--chart-4` (blue) → `--chart-5` (violet).

## 7. Interaction & Motion

Dashboard motion is minimal and functional, not decorative like marketing: hover-state color/background transitions (`transition-colors`), a pulsing dot for "live" indicators (`animate-pulse`), dropdown open/close with a rotating chevron. No scroll-reveal or stagger animation in the authenticated app — keep it that way; this is an operational console, not a landing page, and it needs to feel instantly responsive rather than cinematic.

## 8. Conventions to Preserve

1. Style dark-theme values via inline `style={{ ... : 'var(--token)' }}` for anything not covered by a Tailwind utility — this is the dominant pattern in existing components (sidebar, header, KPI cards), not arbitrary-value Tailwind classes. Follow it for consistency in new components.
2. Only 4 status states, ever: Optimal / Watch / Advisory / Critical. Don't add a 5th.
3. Model outputs always use the CLAUDE.md §7 user-facing names, never internal/technical names — same rule as marketing.
4. Health scores: one decimal place (`82.4%`). PUE: two decimal places (`1.24`). Money: ZAR. Timestamps: `HH:mm:ss UTC`.
5. `tenant_id` scoping is a backend concern (see project memory / `docs/BACKEND.md`) but the `AppTenantProvider` + `TenantSwitcher`/`useWorkspaceStore` pairing is the frontend surface of it — any new data-fetching component should assume it lives inside that provider, not re-derive tenant context another way.
