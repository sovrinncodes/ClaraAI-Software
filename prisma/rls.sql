-- Clara AI — PostgreSQL Row Level Security
--
-- Apply AFTER running `prisma migrate dev` against a live RDS instance.
-- Each table gets RLS enabled + a single isolation policy keyed to the
-- per-transaction setting `app.current_tenant_id`, which Prisma middleware
-- injects via `SET LOCAL` at the start of every transaction.
--
-- Usage:
--   psql "$DATABASE_URL" -f prisma/rls.sql

-- ─── Enable RLS ───────────────────────────────────────────────────────────────

ALTER TABLE facilities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_baselines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_usage       ENABLE ROW LEVEL SECURITY;

-- ─── Isolation policies ───────────────────────────────────────────────────────
--
-- `current_setting('app.current_tenant_id', true)` — the second argument (true)
-- means "return empty string if not set" rather than throwing an error.
-- This keeps superuser / migration sessions working without a tenant context.

CREATE POLICY tenant_isolation ON facilities
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON assets
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON health_scores
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON alerts
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON energy_baselines
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON esg_reports
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON esg_scores
  USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation ON water_usage
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- ─── Allow service role to bypass RLS for migrations and seeding ──────────────
--
-- Grant the application role BYPASSRLS only if it is a dedicated migration
-- role, not the application runtime role. The application runtime role should
-- NOT have BYPASSRLS — RLS enforcement is the point.
--
-- ALTER ROLE claraai_migrations BYPASSRLS;

-- ─── Verification query ───────────────────────────────────────────────────────
--
-- After applying, confirm all tables have RLS enabled:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'facilities','assets','health_scores','alerts',
--     'energy_baselines','esg_reports','esg_scores','water_usage'
--   );
--
-- All rows should show rowsecurity = true.
