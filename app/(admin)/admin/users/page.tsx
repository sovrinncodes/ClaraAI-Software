import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { adminListUsers } from '@/lib/db/queries/admin/users'
import { adminListTenantOverviews } from '@/lib/db/queries/admin/tenants'
import { extractPlatformRoleFromHeaders } from '@/lib/utils/staff'
import { UserRowActions } from '@/components/admin/user-row-actions'
import { AddUserForm } from '@/components/admin/add-user-form'

export const metadata: Metadata = { title: 'Users' }
export const dynamic = 'force-dynamic'

const TH_CLASS = 'px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest'
const TD_CLASS = 'px-4 py-3 text-sm'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tenantId?: string }>
}) {
  const { search, tenantId } = await searchParams
  const role = extractPlatformRoleFromHeaders(await headers())
  const canManageStaffRoles = role === 'SUPER_ADMIN'

  const [users, tenants] = await Promise.all([
    adminListUsers({ search: search || undefined, tenantId: tenantId || undefined }),
    adminListTenantOverviews(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Users
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Every user across every tenant. Staff roles are managed here too.
        </p>
      </div>

      {/* Add user (Cognito invite email lands with auth go-live) */}
      <div
        className="rounded-[10px] border p-4 space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <span
          className="text-[10px] font-medium uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Add User To Tenant
        </span>
        <AddUserForm tenants={tenants.map((tenant) => ({ id: tenant.id, name: tenant.name }))} />
      </div>

      {/* Filters */}
      <form method="get" className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          name="search"
          defaultValue={search ?? ''}
          placeholder="Search name or email…"
          className="rounded-md border px-3 py-1.5 text-sm w-64 bg-transparent outline-none"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        />
        <select
          name="tenantId"
          defaultValue={tenantId ?? ''}
          className="rounded-md border px-3 py-1.5 text-sm outline-none"
          style={{
            borderColor: 'var(--border-default)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All tenants</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
          style={{ borderColor: 'var(--border-default)' }}
        >
          Filter
        </button>
      </form>

      {/* Users table */}
      <div
        className="rounded-[10px] border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className={TH_CLASS}>User</th>
                <th className={TH_CLASS}>Tenant</th>
                <th className={TH_CLASS}>Status</th>
                <th className={TH_CLASS}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    opacity: user.isDisabled ? 0.55 : 1,
                  }}
                >
                  <td className={TD_CLASS}>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.name ?? user.email}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {user.email}
                      {user.platformRole ? ` · STAFF: ${user.platformRole}` : ''}
                    </p>
                  </td>
                  <td className={TD_CLASS}>
                    <Link
                      href={`/admin/tenants/${user.tenant.id}`}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {user.tenant.name}
                    </Link>
                  </td>
                  <td className={TD_CLASS}>
                    <span
                      className="font-mono text-[10px]"
                      style={{
                        color: user.isDisabled ? 'var(--status-critical)' : 'var(--status-optimal)',
                      }}
                    >
                      {user.isDisabled ? 'DISABLED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className={TD_CLASS}>
                    <UserRowActions
                      userId={user.id}
                      email={user.email}
                      role={user.role}
                      platformRole={user.platformRole}
                      isDisabled={user.isDisabled}
                      canManageStaffRoles={canManageStaffRoles}
                    />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No users match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
