import { PrismaClient } from '@prisma/client'
import { seedDemoScenario } from '../lib/db/demo-seed'

const prisma = new PrismaClient()

async function main() {
  await seedDemoScenario(prisma)
  console.log('✓ Demo seed complete — tenant: tenant_cpt (Sovrinn)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
