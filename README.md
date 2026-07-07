# Clara AI

**ESG intelligence and predictive maintenance for industrial and commercial facilities.**

Clara AI is a multi-tenant SaaS platform built by CompletePropertyTech (CPT) that ingests operational telemetry from building systems (HVAC, industrial machinery, energy meters, power infrastructure), applies machine learning models, and gives facility managers:

- **Predictive maintenance alerts** — equipment failure forecasting 7+ days in advance
- **Energy optimisation insights** — anomaly detection against an ML baseline
- **ESG compliance reporting** — GHG Protocol Scope 1/2/3, GRI 302/303/305
- **Real-time facility health monitoring** — portfolio-wide dashboards with live alerting

The current build is a proof-of-concept: a synthetic telemetry replay engine streams pre-processed public datasets (ASHRAE, UNSW bearing data, LBNL HVAC, MIMII) into the platform to simulate live sensors, so the full product experience can be demoed and evaluated before real hardware integration.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL + Prisma ORM (with Row Level Security for tenant isolation) |
| Auth | AWS Cognito (JWT) via Auth.js, `jose` for verification |
| Charts | Recharts, Apache ECharts |
| State | TanStack Query, Zustand |
| Cloud (target) | AWS — API Gateway, Lambda, IoT Core, Timestream, SageMaker, AppSync, S3, SES, Fargate |

## Architecture highlights

- **Multi-tenant by design.** Every query is scoped to `tenant_id` at the application layer, enforced again by PostgreSQL Row Level Security policies, and validated at the edge via a Cognito JWT custom claim. See `docs/BACKEND.md` and `lib/db/client.ts`.
- **Two surfaces, one codebase.** The tenant-facing app lives under `app/(app)/`; an internal staff/admin console lives under `app/(admin)/admin/`, gated by a separate platform-role tier (`SUPER_ADMIN` / `SUPPORT` / `ANALYST`) that is completely independent of tenant roles and invisible (404) to anyone without it.
- **Synthetic demo mode.** With `NEXT_PUBLIC_SYNTHETIC_MODE=true`, the edge proxy (`proxy.ts`) injects a demo tenant and bypasses Cognito entirely — useful for local development and demos without live AWS infrastructure.
- **User-facing model naming.** The ten underlying ML models (LSTM RUL regression, 1D CNN on FFT, isolation forest, etc.) are always presented to users under plain-English names (e.g. "Failure Forecast", "Energy Waste Detector") — see `lib/data/model-catalogue.ts`.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL 15+ database (local, Docker, or hosted)

### Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/claraai"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXT_PUBLIC_SYNTHETIC_MODE="true"      # skips Cognito, uses demo tenant
SYNTHETIC_PLATFORM_ROLE="SUPER_ADMIN"  # grants /admin access in synthetic mode
```

Then:

```bash
npm run db:push     # apply the Prisma schema
npm run db:seed     # seed the demo tenant, facilities, assets, and alerts
npm run dev
```

Visit `http://localhost:3000` for the tenant app and `http://localhost:3000/admin` for the staff console.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm start` | Production build and start |
| `npm test` | Run the Vitest suite |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Seed the demo scenario |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```text
app/
  (marketing)/     # public landing pages
  (auth)/          # login / signup / verify
  (app)/           # authenticated tenant application
  (admin)/admin/   # internal staff console (platform-role gated)
  api/             # route handlers, mirrored tenant / admin split
components/        # UI components, organised by feature area
lib/
  db/              # Prisma client, tenant + admin query layers, demo seed
  aws/             # Cognito, AppSync, SageMaker clients
  utils/           # tenant context, staff/role gating, impersonation signing
prisma/            # schema, seed script
docs/              # architecture, AWS integration, and design references
```

## Deployment

Deploys to Vercel. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full staging
setup runbook (project linking, database provisioning, environment variables).

## Security notes

- Tenant isolation is enforced at three layers: JWT claim → application-level `WHERE tenant_id = …` → PostgreSQL Row Level Security. See `docs/BACKEND.md` and `docs/INTEGRATION.md`.
- The staff console cannot be discovered by tenant users — routes return `404` (not `403`) without a valid platform role, and the check runs independently in both the edge proxy and every API route handler.
- Staff "view as tenant" (impersonation) sessions are short-lived, HMAC-signed, and fully audit-logged (`AuditLog` model).
- No secrets are committed to this repository. Copy `.env.example` to `.env.local` (or configure equivalent secrets in your deployment platform) and never commit real credentials, connection strings, or API keys.

## License

Proprietary — © CompletePropertyTech. All rights reserved.
