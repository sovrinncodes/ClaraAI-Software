# Clara AI — Backend Infrastructure: What Was Built

**CompletePropertyTech (CPT) | Data Centre MVP | Retrospective Documentation**

This document explains everything that has been implemented in the Clara AI backend so far — the database layer, authentication and multi-tenant isolation, the API surface, the ESG calculation engine, the AWS service clients, and the seeded demo data. It describes the **as-built** state of the codebase. For forward-looking AWS provisioning instructions (Cognito pool creation, IoT rules, Timestream queries, etc.), see [INTEGRATION.md](./INTEGRATION.md).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Backend Architecture Overview](#2-backend-architecture-overview)
3. [Database Layer (Prisma + PostgreSQL)](#3-database-layer-prisma--postgresql)
4. [Authentication & Multi-Tenant Isolation](#4-authentication--multi-tenant-isolation)
5. [API Layer (Next.js Route Handlers)](#5-api-layer-nextjs-route-handlers)
6. [Data Access Layer (Query Modules)](#6-data-access-layer-query-modules)
7. [ESG Engine](#7-esg-engine)
8. [AWS Service Clients](#8-aws-service-clients)
9. [Seed Data](#9-seed-data)
10. [Environment Configuration](#10-environment-configuration)
11. [Key Design Decisions](#11-key-design-decisions)
12. [Known Gaps & Phase 2 Work](#12-known-gaps--phase-2-work)
13. [File Inventory](#13-file-inventory)

---

## 1. Executive Summary

The backend for the Clara AI PoC was built **inside the Next.js 16 application** rather than as a separate service. It consists of five layers, all implemented in TypeScript:

| Layer | Location | What was built |
|---|---|---|
| **Database schema** | `prisma/schema.prisma` | 10 Prisma models, 7 enums, full multi-tenant indexing — extended beyond the original spec with ESG scoring and water-usage models |
| **Auth & tenant isolation** | `proxy.ts`, `lib/auth.ts`, `lib/aws/cognito.ts`, `lib/utils/tenant.ts` | Cognito JWT verification (JWKS/RS256 via `jose`), NextAuth v5 session wiring, edge proxy that injects `x-tenant-id` into every request, plus a synthetic demo mode |
| **API routes** | `app/api/**` | 8 REST endpoints covering facilities, assets, alerts, health scores, ESG scoring, and ESG report generation — every one tenant-scoped and wrapped in a consistent `{ success, data | error }` envelope |
| **Query layer** | `lib/db/queries/*` | Repository-style typed query functions per domain (tenants, facilities, assets, alerts, health-scores, esg) — the only place Prisma is called from |
| **ESG engine** | `lib/esg/*` | A four-layer pure-function calculation pipeline: South African emission factors → scope 1/2/3 calculators → 6-dimension composite score engine → 5 reporting-framework adapters (GRI 302/303/305, GHG Protocol, ISO 50001) |

Supporting pieces: AWS SDK clients for SageMaker inference (all 10 Clara AI models mapped), AppSync GraphQL subscription templates, a Prisma seed script that creates the CompletePropertyTech demo tenant with its 4 facilities and the CHL-01 demo chiller scenario, and a complete `.env.example` covering every required variable.

The hard architectural requirement — **zero cross-tenant data leakage** — is enforced in code at two of the three planned levels (request proxy + application queries). The third level (PostgreSQL Row Level Security) is documented and SQL-ready but not yet applied, because database migrations have not been run against a live Postgres instance yet (see [Section 12](#12-known-gaps--phase-2-work)).

---

## 2. Backend Architecture Overview

### Why the backend lives inside Next.js

For the PoC, the Next.js App Router serves both the dashboard UI and the REST API. Route handlers under `app/api/` run as serverless functions and talk to PostgreSQL through Prisma. This keeps a single deployable artifact while remaining compatible with the production AWS topology (API Gateway in front, Lambda behind), because:

- Tenant context arrives via the `x-tenant-id` request header — exactly what API Gateway's Cognito authoriser will inject in production.
- The query layer and ESG engine are framework-agnostic pure TypeScript and can be lifted into standalone Lambdas without modification.

### Request flow (as implemented)

```
Browser / API client
      │
      ▼
proxy.ts  (Next.js 16 edge proxy — replaces middleware.ts)
      │   1. Public paths (/login, /signup, /verify, /api/auth) pass through
      │   2. SYNTHETIC_MODE=true → inject x-tenant-id: tenant_cpt, x-user-role: TENANT_ADMIN
      │   3. Otherwise → verify Cognito JWT (JWKS), extract custom:tenant_id,
      │      inject x-tenant-id / x-user-id / x-user-role headers,
      │      redirect to /login on failure
      ▼
app/api/* route handler
      │   extractTenantFromHeaders() → 401 if missing
      ▼
lib/db/queries/*  (every query starts WHERE tenantId = ...)
      ▼
lib/db/client.ts  (Prisma singleton)
      ▼
PostgreSQL
```

### The three-layer tenant isolation model

| Layer | Status | Implementation |
|---|---|---|
| 1. Edge / gateway | ✅ Built | `proxy.ts` validates the JWT and is the **only** source of `x-tenant-id`. No route ever reads `tenantId` from the body or query string. |
| 2. Application | ✅ Built | Every function in `lib/db/queries/*` takes `tenantId` as its **first parameter** and puts it first in the `WHERE` clause — convention #1 from the project brief, followed without exception. |
| 3. Database (RLS) | 📋 SQL written, not applied | RLS policies for all 8 tenant-scoped tables are documented in `INTEGRATION.md` §17 and `schema.md`; they get applied as part of the first migration against live RDS. |

---

## 3. Database Layer (Prisma + PostgreSQL)

### Tooling decisions

- **Prisma v6 (`^6.19.3`)**, deliberately pinned. Prisma v7 changed the `datasource` block in a way that broke `url = env("DATABASE_URL")` with this schema, so v6 is the supported version for this project.
- **`prisma-client-js`** generator, classic client.
- **Singleton client** (`lib/db/client.ts`): the standard `globalThis` pattern so Next.js hot-reload in development doesn't exhaust connection pools. Production Lambda deployments should add Prisma Accelerate or pgBouncer (documented in INTEGRATION.md §11).

```typescript
// lib/db/client.ts — the entire file
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### The schema — 10 models, 7 enums

All tenant-scoped tables carry `tenantId` with an `@@index([tenantId])`, snake_case table mappings via `@@map`, and cuid primary keys.

**Models as specified in the original project brief:**

| Model | Table | Purpose | Notable fields |
|---|---|---|---|
| `Tenant` | `tenants` | One row per customer org | `slug` (unique), `plan`, back-relations to everything |
| `User` | `users` | Dashboard users | `cognitoSub` (unique — links to Cognito identity), `role` enum |
| `Facility` | `facilities` | Physical sites | `externalId` (e.g. `JHB-DC-01`), `type`, `status`, `tierRating`, `gridZone`, `metadata Json?` |
| `Asset` | `assets` | Monitored equipment | `externalId` (e.g. `CHL-01`), `type` (13-value enum), `isCritical`, `refrigerant`, serial/manufacturer fields |
| `HealthScore` | `health_scores` | ML model output per asset per interval | `score`, `predictedTtfDays`, `faultType`, `faultConfidence`, `vibrationRms`, `operatingLoad`, `isoZone`, `modelVersion`; indexed on `recordedAt` |
| `Alert` | `alerts` | Model-generated alerts | `severity`, `status`, `modelName` (user-facing model name), `recommendation`, `acknowledgedAt`/`resolvedAt`; indexed on `status` and `createdAt` |
| `EnergyBaseline` | `energy_baselines` | Actual vs ML-baseline energy per 15-min interval | `baselineKwh`, `actualKwh`, `deviationPct`, `anomalyFlag` |
| `EsgReport` | `esg_reports` | Generated compliance reports | Scope 1/2/3 tCO₂e, `pueAverage`, `dataCompletePct`, `pdfUrl` |

**Extensions added beyond the original spec** (driven by the ESG research document):

| Addition | What & why |
|---|---|
| `EsgScore` model (`esg_scores`) | Persists every computed composite ESG score with all six dimension scores (`energyDimScore`, `carbonDimScore`, `equipmentDimScore`, `renewableDimScore`, `waterDimScore`, `reportingDimScore`), emissions snapshot, `renewablePct`, `pueAverage`, and the reporting period. `facilityId` is nullable — `null` means a portfolio-level aggregate. This is what makes the dashboard ESG card instant (cached read) instead of recomputing on every page load. |
| `WaterUsage` model (`water_usage`) | Kilolitres consumed per facility per period, with `wue` (Water Usage Effectiveness, L/kWh IT load) and a `source` discriminator (`municipal \| borehole \| recycled \| mixed`) that drives Scope 3 water emission factors. Required for the GRI 303 report and the Water Efficiency score dimension. |
| `ReportFramework` enum extended | Added `GRI_303` (water) and `GRI_305` (emissions) to the original `GRI_302 / GHG_PROTOCOL / ISO_50001 / TCFD / GRESB` set. |
| `EsgReport` extended | Added `reportName`, `status` (`ready \| generating \| failed`), and `payload Json?` — the full structured framework output is stored on the report row so the report viewer needs no recomputation. Also added a `@@index([generatedAt])`. |
| `Tenant.assets` back-relation | The original spec's schema was missing the `assets Asset[]` relation on `Tenant` (the `Asset` model referenced it); added so the schema validates. |

### Enums

`UserRole` (3), `FacilityType` (5), `FacilityStatus` (4 — the canonical Optimal/Watch/Advisory/Critical states), `AssetType` (13), `AlertSeverity` (4), `AlertStatus` (4, including `FALSE_POSITIVE`), `ReportFramework` (7).

### Migration status

No `prisma/migrations/` directory exists yet — the schema has been authored and type-checked (Prisma client generated from it powers all the typed queries), but `prisma migrate dev` has not been run against a live PostgreSQL instance. First-run sequence when a database is available:

```bash
npx prisma migrate dev --name init
# apply the RLS SQL from INTEGRATION.md §17
npx prisma db seed
```

---

## 4. Authentication & Multi-Tenant Isolation

### 4.1 The edge proxy — `proxy.ts`

Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; this project follows the new convention. The proxy is the single enforcement point for authentication and the single producer of tenant-context headers.

What it does, in order:

1. **Public path allowlist** — `/login`, `/signup`, `/verify`, `/api/auth` pass through untouched (the matcher also excludes `_next/static`, `_next/image`, `favicon.ico`).
2. **Synthetic demo mode** — when `NEXT_PUBLIC_SYNTHETIC_MODE=true` (the PoC default), Cognito is skipped entirely and the headers `x-tenant-id: tenant_cpt` / `x-user-role: TENANT_ADMIN` are injected. This lets the entire backend run locally with zero AWS configuration while exercising the exact same header contract production will use.
3. **Production JWT path** — extracts the `Authorization: Bearer` token, verifies it cryptographically against the Cognito JWKS (see 4.2), extracts `custom:tenant_id`, and:
   - No token → redirect to `/login?callbackUrl=<original path>`
   - Valid token but no tenant claim → `403 { error: 'No tenant claim in token' }`
   - Verification failure → redirect to `/login`
   - Success → injects `x-tenant-id`, `x-user-id` (the Cognito `sub`), and `x-user-role` headers.

### 4.2 Cognito JWT verification — `lib/aws/cognito.ts`

Token verification is done with the `jose` library — no Amplify dependency in the verification path:

- `createRemoteJWKSet` pointed at `https://cognito-idp.<region>.amazonaws.com/<poolId>/.well-known/jwks.json`. The JWKS set is **cached in a module-level variable** so warm Lambda invocations / repeated edge calls don't refetch keys.
- `jwtVerify` enforces the exact issuer URL and pins the algorithm to `RS256`.
- A typed `CognitoClaims` interface exposes `custom:tenant_id`, `custom:role`, `email`, `name`, `sub`.
- Helper functions: `extractBearerToken()` (strict `Bearer ` prefix parsing), `extractTenantId()`, `extractUserRole()` (defaults to `READ_ONLY` — least privilege when the claim is absent).

### 4.3 Session layer — `lib/auth.ts` (NextAuth / Auth.js v5)

NextAuth v5 (beta) is configured with Cognito as an OIDC provider:

- **Module augmentation** extends the `Session` type so `session.user.tenantId` and `session.user.userRole` are type-safe throughout the app.
- The **`jwt` callback** copies `custom:tenant_id` and `custom:role` from the Cognito profile into the NextAuth token at sign-in (role defaults to `READ_ONLY`).
- The **`session` callback** exposes `id`, `tenantId`, and `userRole` to `useSession()` consumers.
- Custom pages: both `signIn` and `error` route to `/login`.
- The route handler at `app/api/auth/[...nextauth]/route.ts` is a two-line re-export of `handlers` — all logic lives in `lib/auth.ts`.

### 4.4 Tenant extraction utility — `lib/utils/tenant.ts`

Two deliberately tiny functions form the contract between proxy and routes:

```typescript
export function extractTenantFromHeaders(headers: Headers): string | null {
  return headers.get('x-tenant-id')
}

export function assertTenantContext(ctx: TenantContext | null): asserts ctx is TenantContext {
  if (!ctx) throw new Error('Tenant context not available')
}
```

Every API route's first three lines are the same: extract the tenant, return `401 Unauthorized` if absent. There is no code path that reaches a query without a tenant ID.

---

## 5. API Layer (Next.js Route Handlers)

Eight endpoints were implemented. All of them share the same structure:

1. Extract tenant from headers → `401` if missing
2. Parse/validate query params or JSON body → `400` with a specific message on bad input
3. Delegate to the query layer (never inline Prisma)
4. Return the standard envelope; catch-all `try/catch` logs server-side with a route tag (e.g. `[GET /api/facilities]`) and returns a generic `500` — internal error details are never leaked to clients

**Response envelope (every endpoint):**

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

### 5.1 `GET /api/facilities`

Lists the tenant's facilities. Query params: `status` (FacilityStatus), `type` (FacilityType), `search` (case-insensitive partial match on name, externalId, or city). Each row includes `_count` of assets and alerts for the facility cards.

### 5.2 `GET /api/facilities/[facilityId]`

Single facility detail: full record + all assets (ordered by externalId) + up to 20 most recent ACTIVE alerts + total asset count. Uses `findFirst({ where: { tenantId, id } })` so a valid facility ID belonging to another tenant returns nothing.

### 5.3 `GET /api/assets`

Cross-facility asset list. Query params: `facilityId`, `type`, `watchlist=true`, `search`. Each asset includes its **latest health score** (`healthScores[0]`) and active-alert count. `watchlist=true` switches to the dedicated watchlist query: assets with health < 85 in the last 24 h **or** any active alert, ordered critical-first.

### 5.4 `GET /api/assets/[assetId]`

Full asset detail for the Equipment Health screen: facility relation, the **last 96 health-score records** (7 days at 15-minute intervals — sized exactly for the Health Degradation chart), and the last 10 active alerts for the asset alert log.

### 5.5 `GET /api/alerts` + `PATCH /api/alerts`

- **GET** — filters: `severity`, `status` (defaults to `ACTIVE`), `facilityId`, `assetId`, `limit` (default 50), and `countsOnly=true` which returns `{ critical, advisory, watch, total }` via three parallel `count` queries (powers the Active Alerts KPI card and the sidebar badge).
- **PATCH** — body `{ alertId, action: 'acknowledge' | 'resolve' }`. Sets `acknowledgedAt`/`resolvedAt` to the current UTC timestamp and flips the status. The update's `where` clause includes `tenantId`, so a tenant cannot acknowledge another tenant's alert even with a known ID.

### 5.6 `GET /api/health-scores/[assetId]`

Health-score history for the degradation chart. Params: `days` (default 7) or `latest=true` for the single most recent record. History is returned **ascending by `recordedAt`** so the frontend can plot it directly without re-sorting.

### 5.7 `GET /api/esg/score`

The most involved read endpoint — computes (or returns cached) the **ESG Insight Score** shown on the dashboard.

- `facilityId` param scopes to one facility; omitted = portfolio-level aggregate (stored with `facilityId = null`).
- **Cache-first**: unless `refresh=true`, the latest persisted `EsgScore` row is returned immediately.
- On recompute, the route runs a five-stage pipeline:
  1. Fetch in-scope facilities with their YTD `EnergyBaseline` records
  2. Aggregate actual kWh per facility — **falling back to deterministic synthetic defaults** per facility type when no telemetry exists yet (e.g. DATA_CENTER = 15,768,000 kWh = 1.8 MW × 8,760 h), so the PoC always produces realistic numbers
  3. Fetch `WaterUsage` records for Scope 3 + water dimension
  4. Fetch the latest health score per asset via `getAssetHealthSummary()` — this wires **predictive maintenance directly into the ESG score**
  5. Run `calcTotalEmissions()` + `calcEnergyMetrics()` + `computeEsgScore()` and **persist the result** to `esg_scores` before responding

The response includes the composite score, all six dimension breakdowns (score, weight, weighted contribution, and the raw inputs used), scope emissions, and energy metrics.

### 5.8 `POST /api/esg/report/generate`

Generates a structured compliance report for one facility and one framework.

- Body: `{ facilityId, framework, periodStart, periodEnd, reportName? }` — all four required fields validated, dates parsed and sanity-checked (`start < end`), and the facility's tenant ownership verified before any work happens.
- Builds the same emissions/metrics/score inputs as the score endpoint (scoped to the requested period), then dispatches to the matching framework adapter: `GRI_302`, `GRI_303`, `GRI_305`, `GHG_PROTOCOL`, or `ISO_50001`.
- Persists a complete `EsgReport` row with `status: 'ready'` and the full framework `payload` JSON, then returns `{ reportId, esgScore, dimensions, emissions, energyMetrics, framework, payload }`.
- `dataCompletePct` is honest about data provenance: 92 when real energy-baseline records existed for the period, 70 when synthetic fallbacks were used.

---

## 6. Data Access Layer (Query Modules)

All database access goes through typed functions in `lib/db/queries/` — routes never call Prisma directly. Every exported function's **first parameter is `tenantId`**, and that filter is always first in the `WHERE` input. Filters are typed with Prisma's generated types (`Prisma.AssetWhereInput` etc.) and built with conditional spreads, so unset filters add no SQL clauses.

| Module | Functions | Notes |
|---|---|---|
| `tenants.ts` | tenant lookup helpers | Small — tenant bootstrap/lookup |
| `facilities.ts` | `getFacilities(tenantId, { status, type, search })`, `getFacilityById` | Search hits name/externalId/city, case-insensitive; includes asset+alert counts |
| `assets.ts` | `getAssets`, `getAssetById`, `getWatchlistAssets` | `getAssetById` pulls 96 health records; watchlist implements the "health < 85 in 24 h OR active alert" rule with critical-first ordering |
| `alerts.ts` | `getAlerts`, `getActiveAlerts`, `getCriticalAlerts`, `acknowledgeAlert`, `resolveAlert`, `getAlertCounts` | Counts run as three parallel `prisma.alert.count` calls; updates carry `tenantId` in the `where` |
| `health-scores.ts` | `getLatestHealthScore`, `getHealthScoreHistory`, `getPortfolioHealthIndex`, `getEnergyBaselines` | Portfolio index = average of each asset's latest score (groupBy assetId, then latest per asset); returns 100 when no data |
| `esg.ts` | 12 functions across five sections | The largest module — detailed below |

### `esg.ts` in detail

- **Reports**: `getEsgReports` (list w/ facility info, newest first), `getEsgReportById`, `createEsgReport`, `updateEsgReportStatus` (uses `updateMany` with tenant filter so status flips are tenant-safe).
- **Scores**: `getLatestEsgScore` (note: `facilityId ?? null` — an explicit null match so portfolio scores and facility scores never mix), `getEsgScoreTrend` (last N days, for the sparkline), `upsertEsgScore` (persists a full dimension breakdown).
- **Asset health summary**: `getAssetHealthSummary(tenantId, facilityIds)` — fetches each asset's single latest health record (`take: 1`, desc) plus `isCritical`, filters out assets with no health data, and returns the flat `AssetHealthRow[]` consumed by the Equipment Sustainability dimension.
- **Energy baselines**: `getEnergyBaselines` + `getEnergyBaselineSummary` which reduces a period to `{ totalActualKwh, totalBaselineKwh, overallDeviationPct, anomalyCount, recordCount }`.
- **Water**: `getWaterUsage` per facility/period and `getPortfolioWaterTotal`.
- **Dashboard KPIs**: `getPortfolioEsgKpis` — one call powering the ESG dashboard card; runs the latest score, water total, and ready-report scope sums in a single `Promise.all`.

---

## 7. ESG Engine

The ESG engine is the largest piece of net-new backend logic. It is structured as four strictly-layered modules — each layer imports only from the one below it, and the bottom three are **pure functions with zero database or framework dependencies**, which makes them unit-testable in isolation and portable to a Lambda.

```
lib/esg/emission-factors.ts    ← Layer 1: physical constants
lib/esg/calculators.ts         ← Layer 2: pure math
lib/esg/score-engine.ts        ← Layer 3: composite scoring
lib/esg/framework-adapters.ts  ← Layer 4: report formatting
        ↑ consumed by app/api/esg/* routes (the only impure layer)
```

All shared shapes (`EnergyMetrics`, `ScopeEmissions`, `EsgDimensionScore`, `EsgScoreResult`, the five report payload types, fuel/refrigerant/water input types) live in `types/esg.ts` (243 lines).

### Layer 1 — Emission factors (`emission-factors.ts`)

South Africa-specific physical constants with sourcing documented inline:

- **Grid electricity**: 0.9006 kgCO₂e/kWh (2023 DFFE national / Eskom factor), with a Cape Town regional variant (0.8800) and a 0.0 factor for market-based renewable (RECs/PPAs). `getGridFactor(country, region)` picks the right one.
- **Fuel combustion** (Scope 1): diesel, petrol, LPG (litres & kg), natural gas (m³ & kg) — IPCC/GHG Protocol factors, keyed by a `${FuelType}_${FuelUnit}` template-literal type so invalid combinations are unrepresentable.
- **Refrigerant GWP** (Scope 1 fugitive): AR5 100-year values for R22, R410A, R134a, R407C, R32, R404A, R507A.
- **Water** (Scope 3): kgCO₂e/kL by source — municipal 0.344 (SA DWS lifecycle), borehole 0.130, recycled 0.080, mixed 0.280.
- **Unit conversions**: kWh→MJ (3.6), diesel litre→MJ, gas m³→MJ — needed because GRI 302 discloses in megajoules.

### Layer 2 — Calculators (`calculators.ts`)

Deterministic scope math, each function reducing typed input arrays:

- `calcScope2(gridKwh, country, region)` → tCO₂e from purchased electricity
- `calcFuelEmissions` / `calcRefrigerantEmissions` → the two Scope 1 components
- `calcWaterEmissions` → Scope 3
- `calcTotalEmissions(inputs)` → assembles `ScopeEmissions { scope1, scope2, scope3, total }`, splitting grid vs renewable kWh first so renewables never incur Scope 2
- `calcEnergyMetrics` → `{ totalKwh, renewableKwh, gridKwh, renewablePct, pueRatio, wueRatio, energyIntensityKwhPerSqm }`
- **Score normalisers**: `pueToScore` (PUE 1.0 → 100, 2.5+ → 0), `wueToScore` (WUE 1.0 → 100, 5.0+ → 0), `carbonIntensityToScore` (0 tCO₂e/MWh → 100, 1.5 → 0 — the 1.5 worst case deliberately positions SA's coal-heavy 0.90 grid as mid/poor so renewable PPAs visibly move the score)

### Layer 3 — Score engine (`score-engine.ts`)

`computeEsgScore(inputs)` produces the **ESG Insight Score** (the 0–100 number on the dashboard KPI card) as a weighted sum of six dimensions:

| Dimension | Weight | How it's scored |
|---|---|---|
| Energy Efficiency | 30% | Data centres: PUE score × 0.8 + intensity bonus × 0.2. Non-DC: kWh/m² intensity curve. Neutral 60 when no data. |
| Carbon Performance | 20% | Scope 1+2 intensity (tCO₂e/MWh, "within organisational control") through `carbonIntensityToScore`, plus up to +10 pts YoY-reduction bonus. |
| Equipment Sustainability | 20% | **The predictive-maintenance ↔ ESG link.** Weighted-average latest health score across assets, with `isCritical` assets counted **2×** (chillers/CRACs dominate facility energy). An overload penalty fires for assets running above 80% rated load: 0.4 pts per % over, capped at 15, contributing 30% of the adjustment. Neutral 65 when no health data. |
| Renewable Energy Mix | 15% | Base = renewable %, plus a 0.5× bonus for every point above the 30% industry threshold. |
| Water Efficiency | 10% | `wueToScore(wue)`; neutral 65 when no WUE data. |
| Operational Reliability | 5% | Data-completeness percentage as a monitoring-maturity proxy. |

Every dimension returns not just a score but its **inputs object** (e.g. `{ pueRatio, energyIntensityKwhPerSqm }`) — so the API response is fully explainable and the frontend can render "why is my score X" breakdowns.

The practical effect of the equipment dimension: as the seeded CHL-01 chiller degrades from 95% → 82% health, the composite ESG score visibly drops (~0.8 pts), and would fall ~4–5 pts as it approached predicted failure — making ESG demonstrably responsive to predictive maintenance, which is the product's core demo narrative.

### Layer 4 — Framework adapters (`framework-adapters.ts`)

Five builders transform an `EsgScoreResult` into compliance-framework-shaped payloads (stored as `EsgReport.payload` and rendered by the report viewer):

| Builder | Framework | Key disclosures produced |
|---|---|---|
| `buildGri302Report` | GRI 302 Energy | 302-1 energy within the organisation (MJ, renewable/non-renewable split, estimated cooling load from PUE), 302-3 intensity (kWh/m²), 302-4 reduction vs baseline |
| `buildGri303Report` | GRI 303 Water | 303-3 withdrawal by source, 303-4 discharge, 303-5 consumption — using DC industry cooling-tower water-balance assumptions (~50% evaporative loss, ~15% blowdown) until real sub-meters arrive |
| `buildGri305Report` | GRI 305 Emissions | Scope 1 direct, Scope 2 location-based (market-based reserved for Phase 2 REC/PPA data), intensity, YoY |
| `buildGhgProtocolReport` | GHG Protocol | Full Scope 1+2+3 breakdown with intensity denominators |
| `buildIso50001Report` | ISO 50001 | Baseline vs reporting period, improvement %, significant energy uses (top consumers) |

---

## 8. AWS Service Clients

### 8.1 SageMaker — `lib/aws/sagemaker.ts`

The ML inference bridge, built on `@aws-sdk/client-sagemaker-runtime` (AWS SDK v3):

- A single module-level `SageMakerRuntimeClient` (region from `AWS_REGION`, default `af-south-1`).
- **All 10 Clara AI models are mapped** from their user-facing names (`'Failure Forecast'`, `'Energy Baseline'`, …) to `SAGEMAKER_ENDPOINT_*` environment variables — the user-facing-names-only convention from the project brief is enforced at the API boundary.
- `invokeModel({ modelName, payload })` → validates the model name, resolves the endpoint env var (clear errors for unknown model / unconfigured endpoint), sends JSON, decodes the response body, and returns `{ modelName, output, latencyMs }` with measured latency for observability.
- Typed convenience wrappers for the four PoC-critical models: `runFailureForecast`, `runEnergyBaseline`, `runEnergyWasteDetector`, `runFaultTypeIdentifier`.

### 8.2 AppSync — `lib/aws/appsync.ts`

Real-time configuration and subscription contracts:

- `getAppSyncConfig()` reads `NEXT_PUBLIC_APPSYNC_{ENDPOINT,REGION,API_KEY}` and **fails fast at startup** if endpoint/key are missing (per the security rule: validate required secrets up front).
- Three GraphQL subscription templates, each consumed by a matching frontend hook:
  - `onAlertCreated(tenantId)` → `hooks/use-real-time-alerts.ts` (live alert feed + critical banner)
  - `onHealthScoreUpdated(facilityId)` → `hooks/use-facility-health.ts` (LAST SYNC timestamp, watchlist refresh)
  - `onTelemetryReceived(facilityId)` → `hooks/use-telemetry.ts` (24H telemetry chart rolling buffer)

Note the subscriptions are scoped by tenant/facility ID at the GraphQL argument level — the AppSync resolver configuration (server-side) must enforce that scoping in production; the client templates define the contract.

### 8.3 Cognito — `lib/aws/cognito.ts`

Covered in [Section 4.2](#42-cognito-jwt-verification--libawscognitots) — JWKS-based RS256 verification with issuer pinning and claim extraction helpers.

---

## 9. Seed Data

`prisma/seed.ts` (343 lines) creates the **CompletePropertyTech guest-demo tenant** exactly as specified in the project brief, using idempotent `upsert`s with stable IDs (safe to re-run):

- **Tenant**: `tenant_cpt` / slug `complete-property-tech` / enterprise plan. The stable ID matters — it's the same value `proxy.ts` injects in synthetic mode, which is what makes the whole demo work end-to-end without Cognito.
- **User**: `admin@cpt.co.za`, TENANT_ADMIN, with a placeholder `cognitoSub`.
- **4 facilities** matching the spec: Johannesburg DC-1 (`JHB-DC-01`, Tier III, Optimal), Cape Town Assembly (`CPT-MFG-01`, Critical), Pretoria HQ (`PTA-HQ-01`, Advisory), Durban Logistics Hub (`DBN-LOG-01`, Optimal) — each with South African manager names and Eskom grid zones.
- **4 key assets** at JHB-DC-01, headlined by the demo centrepiece **CHL-01** (Carrier AquaEdge chiller, serial 8492-AX-99, R-134a, `isCritical: true`).
- **Health score history** (`createMany`): the CHL-01 7-day degradation curve (95% → 82%) including the day −2 vibration spike, with `predictedTtfDays`, the "Stage 2 Compressor Shaft Bearing Wear" fault type, 89.4% confidence, 4.8 mm/s vibration RMS, ISO Zone D — everything the Health Degradation chart and Clara AI Insight panel render.
- **Alerts** (`createMany`): the active alert set that populates the live feed, the critical banner, and the watchlist.

Tables intentionally **not** seeded: `EnergyBaseline`, `WaterUsage`, `EsgScore`, `EsgReport`. That's why the ESG routes carry synthetic fallbacks (default kWh per facility type, 42.5% renewable assumption, PUE 1.24) — the first call to `GET /api/esg/score` computes and persists the first `EsgScore` row organically.

A separate `lib/data/seed.ts` provides static in-memory demo data for frontend development before a database is connected.

---

## 10. Environment Configuration

`.env.example` enumerates every variable the backend reads, grouped by service:

| Group | Variables | Consumed by |
|---|---|---|
| Database | `DATABASE_URL` | Prisma |
| AWS core | `AWS_REGION` (default `af-south-1`), access keys | All SDK clients |
| Cognito | `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET` (+ `NEXT_PUBLIC_` pair) | `lib/auth.ts`, `lib/aws/cognito.ts` |
| Auth.js | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth v5 |
| AppSync | `NEXT_PUBLIC_APPSYNC_{ENDPOINT,REGION,API_KEY}` | `lib/aws/appsync.ts` |
| IoT Core | `IOT_ENDPOINT`, certificate/key paths | Phase-2 ingestion (replay engine) |
| SageMaker | 9× `SAGEMAKER_ENDPOINT_*` | `lib/aws/sagemaker.ts` |
| S3 / SES | `S3_BUCKET_{DATASETS,REPORTS}`, `SES_FROM_EMAIL` | Phase-2 report PDFs & email |
| Feature flags | `NEXT_PUBLIC_SYNTHETIC_MODE` (+ acoustic/hot-spot flags) | `proxy.ts` and feature gating |

No secrets are committed anywhere in the codebase — every credential flows through environment variables, and the only hardcoded identifiers are the synthetic-mode demo tenant ID and physical constants (emission factors).

### Backend-relevant dependencies (`package.json`)

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.6 | App Router + route handlers + edge proxy |
| `prisma` / `@prisma/client` | ^6.19.3 (pinned to v6) | ORM, schema, migrations, seed |
| `next-auth` | ^5.0.0-beta.31 | Session management with Cognito OIDC |
| `jose` | ^6.2.3 | JWKS fetch + RS256 JWT verification |
| `@aws-sdk/client-sagemaker-runtime` | ^3.1052.0 | ML endpoint invocation |
| `aws-amplify` | ^6.17.0 | AppSync GraphQL subscription client |
| `zod` | ^4.4.3 | Schema validation (forms; available for API body validation) |

---

## 11. Key Design Decisions

1. **Tenant ID is header-only, proxy-produced.** No route reads `tenantId` from a body, query string, or cookie. The proxy is the sole writer of `x-tenant-id`, and in production that responsibility shifts to API Gateway's Cognito authoriser with an identical header contract — so the application code doesn't change between PoC and production.
2. **Synthetic mode as a first-class environment.** Rather than mocking at the data layer, the demo bypass happens at the auth layer only — everything below it (routes, queries, ESG engine) runs exactly the production code path against the seeded tenant.
3. **Repository-style query layer.** Routes are thin; Prisma is confined to `lib/db/queries/*`. This is what makes RLS adoption (Phase 2) a one-file change (transaction-scoped `SET LOCAL app.current_tenant_id` in the client) instead of a refactor.
4. **The ESG engine is pure and layered.** Constants → math → scoring → formatting, with no I/O until the route layer. Every dimension returns its inputs alongside its score, making the composite fully explainable to auditors and the UI.
5. **Predictive maintenance feeds ESG.** The Equipment Sustainability dimension (20% weight, critical assets ×2) is computed from live `HealthScore` rows — the product's central demo story is structural in the backend, not a UI trick.
6. **Honest fallbacks, flagged as such.** Where telemetry doesn't exist yet, deterministic synthetic defaults are used (documented inline as "seed assumption" / "Phase 2: replace with…"), and `dataCompletePct` is scored lower when fallbacks were used.
7. **Cache-then-compute for expensive aggregates.** ESG scores persist to `esg_scores` on every computation; readers get the cached row unless they explicitly pass `refresh=true`.
8. **User-facing model names everywhere.** The SageMaker client keys endpoints by the names users see ("Failure Forecast", not "LSTM RUL Regression"), enforcing brief convention #8 at the integration boundary.
9. **Errors never leak internals.** Route handlers log full errors server-side with a route tag and return only generic messages with correct status codes (400/401/403/404/500).

---

## 12. Known Gaps & Phase 2 Work

Documented honestly so nobody mistakes scaffolding for finished plumbing:

| Item | Status | Notes |
|---|---|---|
| **Database migrations** | ❌ Not run | No `prisma/migrations/` yet — schema is authored and the generated client type-checks the whole codebase, but no live Postgres has been provisioned. `migrate dev` + seed is the first task once `DATABASE_URL` points at a real instance. |
| **RLS policies** | 📋 SQL ready, not applied | Full policy set in INTEGRATION.md §17. Apply after the init migration; then add the transaction-scoped `SET LOCAL app.current_tenant_id` to the Prisma client. |
| **Proxy header propagation** | ⚠️ Verify | `proxy.ts` currently sets tenant headers on `NextResponse.next()`'s response object. Confirm against Next.js 16 proxy semantics that these reach downstream route handlers as *request* headers (the classic middleware pattern required `NextResponse.next({ request: { headers } })`). Works in synthetic-mode testing flows but should be verified before Cognito go-live. |
| **Request body validation with Zod** | Partial | Zod is installed and used in forms; ESG/alert route bodies are validated manually. Migrating to Zod schemas at the API boundary is a quick hardening win. |
| **AppSync live wiring** | Templates only | Subscription contracts and config exist; the hooks fall back to polling until a real AppSync API is provisioned. |
| **Telemetry ingestion** | Not in this repo, by design | IoT Core rules, the ingestion Lambda, Timestream writes, and the Fargate replay engine are separate infrastructure (project brief §17). The MQTT topic scheme, message format, and Timestream query patterns are fully specified in INTEGRATION.md §7/§9/§13. |
| **SES email, S3 report PDFs** | Specified, not implemented | `EsgReport.pdfUrl` and `S3_BUCKET_REPORTS` exist in schema/env; PDF generation + pre-signed URL flow is Phase 2 (pattern in INTEGRATION.md §12/§14). |
| **Rate limiting** | Not implemented | Expected from API Gateway in production; nothing at the Next.js layer for the PoC. |
| **Energy degradation formula** | Heuristic in place | Equipment Sustainability currently uses the `operatingLoad > 80%` overload heuristic; Phase 2 replaces it with `(current_kWh − baseline_kWh) / baseline_kWh` from per-asset Timestream sub-metering. |
| **Market-based Scope 2 / YoY emissions** | Stubbed `null` | Require REC/PPA records and prior-year reports respectively. |
| **Automated tests** | ❌ None yet | The pure ESG layers (`emission-factors`, `calculators`, `score-engine`, `framework-adapters`) are the highest-value, lowest-effort unit-test targets since they're dependency-free. |

---

## 13. File Inventory

Every backend file created, for quick navigation:

```
clara-ai/
├── proxy.ts                              # Edge auth proxy (Next.js 16) — JWT validation + tenant header injection
├── .env.example                          # All required environment variables
│
├── prisma/
│   ├── schema.prisma                     # 10 models, 7 enums — source of truth for the DB
│   └── seed.ts                           # CPT demo tenant: 4 facilities, CHL-01 scenario, health history, alerts
│
├── lib/
│   ├── auth.ts                           # NextAuth v5 + Cognito OIDC, tenant/role claims → session
│   ├── aws/
│   │   ├── cognito.ts                    # JWKS-cached RS256 JWT verification (jose), claim extractors
│   │   ├── appsync.ts                    # AppSync config + 3 GraphQL subscription templates
│   │   └── sagemaker.ts                  # invokeModel() + all 10 model endpoint mappings + typed wrappers
│   ├── db/
│   │   ├── client.ts                     # Prisma singleton
│   │   └── queries/
│   │       ├── tenants.ts                # Tenant lookups
│   │       ├── facilities.ts             # List/detail with filters + counts
│   │       ├── assets.ts                 # List/detail/watchlist (96-record history)
│   │       ├── alerts.ts                 # List/counts/acknowledge/resolve
│   │       ├── health-scores.ts          # Latest/history/portfolio index/baselines
│   │       └── esg.ts                    # Reports, scores, asset-health summary, water, portfolio KPIs
│   ├── esg/
│   │   ├── emission-factors.ts           # Layer 1 — SA grid/fuel/refrigerant/water factors, MJ conversions
│   │   ├── calculators.ts                # Layer 2 — scope 1/2/3 math, metrics, score normalisers
│   │   ├── score-engine.ts               # Layer 3 — 6-dimension weighted composite (ESG Insight Score)
│   │   └── framework-adapters.ts         # Layer 4 — GRI 302/303/305, GHG Protocol, ISO 50001 builders
│   └── utils/
│       └── tenant.ts                     # extractTenantFromHeaders / assertTenantContext
│
├── types/
│   └── esg.ts                            # All ESG engine + report payload types (plus tenant/facility/asset/
│                                         #   alert/telemetry/health/work-order type files)
│
├── app/api/
│   ├── auth/[...nextauth]/route.ts       # NextAuth handler re-export
│   ├── facilities/route.ts               # GET list
│   ├── facilities/[facilityId]/route.ts  # GET detail
│   ├── assets/route.ts                   # GET list / watchlist
│   ├── assets/[assetId]/route.ts         # GET detail (96 health records + alert log)
│   ├── alerts/route.ts                   # GET list/counts, PATCH acknowledge/resolve
│   ├── health-scores/[assetId]/route.ts  # GET history / latest
│   └── esg/
│       ├── score/route.ts                # GET — compute/cache ESG Insight Score
│       └── report/generate/route.ts      # POST — generate framework report
│
└── docs/
    ├── INTEGRATION.md                    # Forward-looking AWS provisioning & wiring reference
    └── BACKEND.md                        # This document
```

---

*Companion documents: [INTEGRATION.md](./INTEGRATION.md) (AWS service setup and wiring), `schema.md` at the project root (schema + RLS + TS types reference), and the project brief `CLAUDE.md` (master spec).*
