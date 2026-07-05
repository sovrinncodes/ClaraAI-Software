import { prisma } from '@/lib/db/client'

export async function getTenantById(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
  })
}

export async function getTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({
    where: { slug },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  })
}

export async function getUserByCognitoSub(cognitoSub: string) {
  return prisma.user.findUnique({
    where: { cognitoSub },
    include: { tenant: true },
  })
}
