import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'node:async_hooks'

// ─── Tenant context store ─────────────────────────────────────────────────────
//
// Populated by withTenantContext() before any Prisma query runs.
// The Prisma middleware reads it to inject SET LOCAL into each transaction,
// which activates the PostgreSQL RLS policies in prisma/rls.sql.

interface TenantStore {
  tenantId: string
}

const tenantStorage = new AsyncLocalStorage<TenantStore>()

// ─── Prisma client singleton ──────────────────────────────────────────────────

// ─── Prisma client singleton ──────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const basePrisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

// Un-extended client for platform-staff code paths (demo reseed/clone) that
// legitimately operate across tenants and take PrismaClient parameters.
export const rawPrisma: PrismaClient = basePrisma

// ─── RLS Extension ────────────────────────────────────────────────────────────
//
// Fires before every Prisma query. If a tenant context is active it issues
// SET LOCAL so PostgreSQL RLS policies enforce row-level isolation for the
// duration of the current transaction.
//
// SET LOCAL is used (not SET) so the setting is scoped to the transaction
// and automatically reset when the transaction commits or rolls back.
// This prevents cross-request tenant leakage in connection-pooled environments.

export const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, args, query }: any) {
      const store = tenantStorage.getStore()
      if (store?.tenantId) {
        // Use executeRaw to set the config local to the transaction.
        // Tagged-template form passes tenantId as a bound parameter.
        await basePrisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${store.tenantId}, true)`
      }
      return query(args)
    }
  }
})


// ─── Public: tenant context wrapper ──────────────────────────────────────────
//
// Wraps any async database operation so all Prisma calls within `fn` fire
// the RLS middleware with the correct tenant_id set.
//
// Usage in API route handlers:
//   const data = await withTenantContext(tenantId, () => getAssets(tenantId))

export async function withTenantContext<T>(
  tenantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return tenantStorage.run({ tenantId }, fn)
}
