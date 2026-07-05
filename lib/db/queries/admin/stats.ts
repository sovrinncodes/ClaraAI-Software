import { prisma } from '@/lib/db/client'
import type { PlatformStats } from '@/types/admin'

export async function adminGetPlatformStats(): Promise<PlatformStats> {
  const [tenants, demoTenants, facilities, assets, users, activeAlerts, criticalAlerts] =
    await prisma.$transaction([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isDemo: true } }),
      prisma.facility.count(),
      prisma.asset.count(),
      prisma.user.count(),
      prisma.alert.count({ where: { status: 'ACTIVE' } }),
      prisma.alert.count({ where: { status: 'ACTIVE', severity: 'CRITICAL' } }),
    ])

  return { tenants, demoTenants, facilities, assets, users, activeAlerts, criticalAlerts }
}
