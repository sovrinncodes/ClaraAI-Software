# Deploying Clara AI on Vercel — Staging Setup

This is a runbook for standing up a **staging** environment on Vercel. It assumes the
build has already been verified locally (`npm run build`) and is written to be run
by whoever holds the correct Vercel account/team for this project — link the
project under the account Clara AI actually belongs to, not a shared/agency account
that happens to be logged in on a given machine.

## 1. Prerequisites

```bash
npm i -g vercel@latest
vercel login
vercel whoami        # confirm you're on the right account
vercel teams ls       # confirm you're pointed at the right team, if applicable
```

## 2. Link the project

From the repo root:

```bash
vercel link --scope <team-or-account>
```

This creates `.vercel/project.json` (already gitignored — never commit it, it contains
project/org IDs tied to your Vercel account).

## 3. Connect the GitHub repository

In the Vercel dashboard: **Project → Settings → Git** → connect
`sovrinncodes/ClaraAI-Software`. Once connected:

- Every push to `main` deploys to **Production**.
- Every push to any other branch (or open PR) deploys to a **Preview** URL automatically — this is how "staging" works on Vercel by default, no extra config needed.

Recommended: use a long-lived `staging` branch as the deploy target for QA, and point
teammates at its Preview URL rather than ad-hoc per-PR previews. Vercel Pro/Enterprise
plans additionally support named **Custom Environments** (Project → Settings →
Environments) if you want a persistent `staging.your-domain` alias instead of a
rotating preview URL.

## 4. Provision a staging database

The synthetic demo mode does not need AWS — it only needs a reachable Postgres.
**Do not point staging at your local Docker/dev database** (`localhost` isn't
reachable from Vercel's build/runtime).

Preferred: Vercel-managed Neon integration.

```bash
vercel integration add neon
vercel env pull .env.local --yes   # confirms DATABASE_URL landed in Vercel envs
```

Then apply the schema and seed the demo scenario against that database:

```bash
DATABASE_URL="<staging-connection-string>" npx prisma db push
DATABASE_URL="<staging-connection-string>" npx tsx prisma/seed.ts
```

## 5. Set environment variables (Preview scope)

If you're using the GitHub integration for deploys (no `vercel` CLI needed for this
part), set these in the dashboard: **Project → Settings → Environment Variables** →
add each one and tick the environment(s) it applies to. Match the environment scope
to whichever URL you're actually testing — a var set only for **Production** won't
apply to a **Preview** deployment and vice versa; this is the single most common
cause of "I set it but it's not working."

**⚠️ `NEXT_PUBLIC_SYNTHETIC_MODE=true` is not scoped to `/demo` — it bypasses login
for every route in the app** (`/dashboard`, `/facilities`, `/settings`, and `/admin`
if `SYNTHETIC_PLATFORM_ROLE` is also set). As of this PoC stage there's no real
Cognito auth configured yet, so enabling it in Production doesn't weaken anything
that currently works — it's a deliberate choice to keep the whole app publicly
viewable, not an accident. **Revisit this once real Cognito/AWS auth is wired up** —
at that point synthetic mode should move to Preview-only, and a scoped guest-demo
flow (grants read-only access to just the demo tenant, not the whole app) should
replace it for Production if a public demo is still wanted.

| Key | Value | Scope |
|---|---|---|
| `DATABASE_URL` | staging Postgres connection string | Preview + Production |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Preview + Production |
| `NEXTAUTH_URL` | the deployment's URL | Preview + Production |
| `NEXT_PUBLIC_SYNTHETIC_MODE` | `true` | Preview + Production |
| `SYNTHETIC_PLATFORM_ROLE` | `SUPER_ADMIN` (to reach `/admin`) | Preview + Production |

Equivalent via CLI, if you do have it linked (repeat with `production` for the
production environment):

```bash
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXTAUTH_URL preview
vercel env add NEXT_PUBLIC_SYNTHETIC_MODE preview
vercel env add SYNTHETIC_PLATFORM_ROLE preview
```

**This is also what makes `/demo` work.** The marketing `/demo` page
(`app/(marketing)/demo/page.tsx`) checks `NEXT_PUBLIC_SYNTHETIC_MODE` itself: if it's
`true`, clicking through redirects straight into the live, pre-populated `/dashboard`;
if unset or `false`, it falls back to a static teaser page with a "Request Demo
Access" → `/signup` CTA instead. If a deployed demo appears to dead-end at signup
instead of showing the live dashboard, this env var is the first thing to check —
**and remember `NEXT_PUBLIC_*` vars are baked in at build time**, so after adding or
changing it you must trigger a new deployment (redeploy), not just save the setting.

Everything else in `.env.example` (Cognito, AppSync, SageMaker endpoints, S3, SES) is
optional for a synthetic-mode staging deploy — those are Phase 2 integrations and the
app degrades gracefully without them (see `CLAUDE.md` §17, "What NOT to Build").

Never add real values for these to a shared/agency Vercel account, and never commit
`.env.local` or a `vercel env pull` output.

## 6. Deploy

```bash
git checkout -b staging
git push -u origin staging
```

Vercel picks up the push and builds a Preview deployment automatically. Or, to deploy
the current working directory directly without a git push:

```bash
vercel deploy   # preview by default; add --prod only for the main/production deploy
```

## 7. Post-deploy checks

- Visit the Preview URL → `/dashboard` should render the seeded demo tenant.
- Visit `/admin` → should render (not 404) if `SYNTHETIC_PLATFORM_ROLE` was set.
- Check build logs for the `postinstall: prisma generate` step — if the client
  wasn't generated, Prisma-backed routes will fail at runtime with a schema
  mismatch, not at build time.

## Notes

- `package.json` pins `"engines": { "node": ">=20.9.0" }` to match Next.js 16's
  minimum — Vercel will provision a matching runtime automatically.
- The `postinstall` script (`prisma generate`) is required for every Vercel
  build; without it the Prisma client is stale relative to `schema.prisma` and
  requests touching the database will fail even though the build succeeds.
