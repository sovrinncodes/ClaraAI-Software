import type { PrismaClient } from '@prisma/client'

// Single source of truth for the CPT demo scenario. Consumed by:
// - prisma/seed.ts (CLI seeding)
// - /api/admin/tenants/[tenantId]/reseed (staff demo reset)
// - /api/admin/tenants (staff demo-tenant cloning)
//
// Takes PrismaClient as a parameter (no '@/' alias) so it runs under both
// `npx tsx prisma/seed.ts` and Next.js route handlers.

export const CANONICAL_DEMO_TENANT_ID = 'tenant_cpt'

export async function seedDemoScenario(prisma: PrismaClient): Promise<void> {
  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'sovrinn' },
    update: { isDemo: true, status: 'ACTIVE' },
    create: {
      id: CANONICAL_DEMO_TENANT_ID,
      name: 'Sovrinn',
      slug: 'sovrinn',
      industry: 'Real Estate & Infrastructure',
      plan: 'enterprise',
      isDemo: true,
    },
  })

  // ── Staff Users ──────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@cpt.co.za' },
    update: { platformRole: 'SUPER_ADMIN' },
    create: {
      tenantId: tenant.id,
      email: 'admin@cpt.co.za',
      name: 'CPT Admin',
      role: 'TENANT_ADMIN',
      platformRole: 'SUPER_ADMIN',
      cognitoSub: 'demo-cognito-sub-admin',
    },
  })

  await prisma.user.upsert({
    where: { email: 'Precisekunle@gmail.com' },
    update: { platformRole: 'SUPER_ADMIN' },
    create: {
      tenantId: tenant.id,
      email: 'Precisekunle@gmail.com',
      name: 'Precise Kunle',
      role: 'TENANT_ADMIN',
      platformRole: 'SUPER_ADMIN',
      cognitoSub: 'demo-cognito-sub-precise',
    },
  })

  // ── Facilities ───────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.facility.upsert({
      where: { id: 'fac_jhb_dc_01' },
      update: { status: 'OPTIMAL' },
      create: {
        id: 'fac_jhb_dc_01',
        tenantId: tenant.id,
        externalId: 'JHB-DC-01',
        name: 'Johannesburg DC-1',
        type: 'DATA_CENTER',
        status: 'OPTIMAL',
        city: 'Johannesburg',
        region: 'Gauteng',
        country: 'ZA',
        tierRating: 'Tier III',
        gridZone: 'Eskom Gauteng',
        managerName: 'Themba Nkosi',
      },
    }),
    prisma.facility.upsert({
      where: { id: 'fac_cpt_mfg_01' },
      update: { status: 'CRITICAL' },
      create: {
        id: 'fac_cpt_mfg_01',
        tenantId: tenant.id,
        externalId: 'CPT-MFG-01',
        name: 'Cape Town Assembly',
        type: 'MANUFACTURING',
        status: 'CRITICAL',
        city: 'Cape Town',
        region: 'Western Cape',
        country: 'ZA',
        gridZone: 'Eskom Western Cape',
        managerName: 'Lindiwe Dube',
      },
    }),
    prisma.facility.upsert({
      where: { id: 'fac_pta_hq_01' },
      update: { status: 'ADVISORY' },
      create: {
        id: 'fac_pta_hq_01',
        tenantId: tenant.id,
        externalId: 'PTA-HQ-01',
        name: 'Pretoria HQ',
        type: 'COMMERCIAL',
        status: 'ADVISORY',
        city: 'Pretoria',
        region: 'Gauteng',
        country: 'ZA',
        managerName: 'Sipho Mokoena',
      },
    }),
    prisma.facility.upsert({
      where: { id: 'fac_dbn_log_01' },
      update: { status: 'OPTIMAL' },
      create: {
        id: 'fac_dbn_log_01',
        tenantId: tenant.id,
        externalId: 'DBN-LOG-01',
        name: 'Durban Logistics Hub',
        type: 'LOGISTICS',
        status: 'OPTIMAL',
        city: 'Durban',
        region: 'KwaZulu-Natal',
        country: 'ZA',
        managerName: 'Zanele Mthembu',
      },
    }),
  ])

  // ── Key Demo Assets ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.asset.upsert({
      where: { id: 'asset_chl_01' },
      update: {},
      create: {
        id: 'asset_chl_01',
        tenantId: tenant.id,
        facilityId: 'fac_jhb_dc_01',
        externalId: 'CHL-01',
        name: 'CHL-01 (Main Chiller Unit)',
        type: 'CHILLER',
        manufacturer: 'Carrier',
        model: 'AquaEdge',
        serialNumber: '8492-AX-99',
        refrigerant: 'R-134a',
        isCritical: true,
        locationInFacility: 'Plant Room A',
      },
    }),
    prisma.asset.upsert({
      where: { id: 'asset_crac_02' },
      update: {},
      create: {
        id: 'asset_crac_02',
        tenantId: tenant.id,
        facilityId: 'fac_cpt_mfg_01',
        externalId: 'CRAC-02',
        name: 'CRAC-02 (Computer Room Air Conditioning)',
        type: 'CRAC_UNIT',
        isCritical: true,
        locationInFacility: 'Server Hall B',
      },
    }),
    prisma.asset.upsert({
      where: { id: 'asset_ups_b' },
      update: {},
      create: {
        id: 'asset_ups_b',
        tenantId: tenant.id,
        facilityId: 'fac_cpt_mfg_01',
        externalId: 'UPS-B',
        name: 'UPS-B (Uninterruptible Power Supply)',
        type: 'UPS',
        isCritical: true,
        locationInFacility: 'Electrical Room',
      },
    }),
    prisma.asset.upsert({
      where: { id: 'asset_ahu_03' },
      update: {},
      create: {
        id: 'asset_ahu_03',
        tenantId: tenant.id,
        facilityId: 'fac_pta_hq_01',
        externalId: 'AHU-03',
        name: 'AHU-03 (Air Handling Unit)',
        type: 'AHU',
        isCritical: false,
        locationInFacility: 'Rooftop Level 3',
      },
    }),
  ])

  // ── Health Scores (latest snapshot for watchlist assets) ─────────────────────
  await prisma.healthScore.createMany({
    data: [
      {
        tenantId: tenant.id,
        assetId: 'asset_chl_01',
        score: 82,
        predictedTtfDays: 45,
        faultType: 'Stage 2 Compressor Shaft Bearing Wear',
        faultConfidence: 0.894,
        vibrationRms: 4.8,
        operatingLoad: 88,
        isoZone: 'D',
        modelVersion: 'bearing-v3.1',
      },
      {
        tenantId: tenant.id,
        assetId: 'asset_crac_02',
        score: 71,
        predictedTtfDays: 12,
        faultType: 'Compressor Overheat',
        faultConfidence: 0.91,
        vibrationRms: 6.1,
        operatingLoad: 97,
        isoZone: 'D',
        modelVersion: 'thermal-v2.4',
      },
      {
        tenantId: tenant.id,
        assetId: 'asset_ups_b',
        score: 78,
        predictedTtfDays: 31,
        faultType: 'Battery Cell Degradation',
        faultConfidence: 0.76,
        operatingLoad: 82,
        modelVersion: 'battery-v1.9',
      },
      {
        tenantId: tenant.id,
        assetId: 'asset_ahu_03',
        score: 84,
        predictedTtfDays: 58,
        faultType: 'Fan Belt Wear',
        faultConfidence: 0.68,
        vibrationRms: 2.9,
        operatingLoad: 71,
        isoZone: 'C',
        modelVersion: 'vibration-v2.1',
      },
    ],
    skipDuplicates: true,
  })

  // ── Active Alerts ─────────────────────────────────────────────────────────────
  const now = new Date()
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60000)

  await prisma.alert.createMany({
    data: [
      {
        id: 'alert_001',
        tenantId: tenant.id,
        facilityId: 'fac_jhb_dc_01',
        assetId: 'asset_chl_01',
        severity: 'ADVISORY',
        status: 'ACTIVE',
        modelName: 'Failure Forecast',
        title: 'CHL-01: Bearing Wear Detected',
        description: 'Stage 2 compressor shaft bearing wear identified. TTF: 45 days.',
        recommendation: 'Schedule maintenance within 30 days. Reduce load to <70%.',
        predictedTtfDays: 45,
        createdAt: minsAgo(12),
        updatedAt: minsAgo(12),
      },
      {
        id: 'alert_002',
        tenantId: tenant.id,
        facilityId: 'fac_cpt_mfg_01',
        assetId: 'asset_crac_02',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        modelName: 'Failure Forecast',
        title: 'CRAC-02: Imminent Failure Risk',
        description: 'Compressor overheat detected. Predicted failure in 12 days.',
        recommendation: 'Immediate inspection required. Prepare replacement unit.',
        predictedTtfDays: 12,
        createdAt: minsAgo(3),
        updatedAt: minsAgo(3),
      },
      {
        id: 'alert_003',
        tenantId: tenant.id,
        facilityId: 'fac_cpt_mfg_01',
        assetId: 'asset_ups_b',
        severity: 'CRITICAL',
        status: 'ACTIVE',
        modelName: 'Failure Forecast',
        title: 'UPS-B: Battery Cell Degradation',
        description: 'Multiple battery cells showing accelerated degradation.',
        recommendation: 'Replace battery bank within 2 weeks.',
        predictedTtfDays: 31,
        createdAt: minsAgo(28),
        updatedAt: minsAgo(28),
      },
      {
        id: 'alert_004',
        tenantId: tenant.id,
        facilityId: 'fac_cpt_mfg_01',
        severity: 'ADVISORY',
        status: 'ACTIVE',
        modelName: 'Energy Waste Detector',
        title: 'CPT-MFG-01: Energy Anomaly +25%',
        description: 'Energy consumption 25% above baseline for past 4 hours.',
        deviationPct: 25.0,
        createdAt: minsAgo(47),
        updatedAt: minsAgo(47),
      },
      {
        id: 'alert_005',
        tenantId: tenant.id,
        facilityId: 'fac_pta_hq_01',
        assetId: 'asset_ahu_03',
        severity: 'ADVISORY',
        status: 'ACTIVE',
        modelName: 'Safe Operating Range',
        title: 'AHU-03: Vibration ISO Zone C',
        description: 'Vibration levels entering ISO 10816 Zone C advisory range.',
        createdAt: minsAgo(91),
        updatedAt: minsAgo(91),
      },
      {
        id: 'alert_006',
        tenantId: tenant.id,
        facilityId: 'fac_jhb_dc_01',
        severity: 'WATCH',
        status: 'ACTIVE',
        modelName: 'PUE Optimiser',
        title: 'JHB-DC-01: PUE Drift +0.03',
        description: 'PUE has drifted from 1.21 to 1.24 over past 48 hours.',
        createdAt: minsAgo(135),
        updatedAt: minsAgo(135),
      },
      {
        id: 'alert_007',
        tenantId: tenant.id,
        facilityId: 'fac_dbn_log_01',
        severity: 'WATCH',
        status: 'ACTIVE',
        modelName: 'Energy Waste Detector',
        title: 'DBN-LOG-01: Off-hours Load +8%',
        description: 'Minor energy load anomaly detected outside operating hours.',
        deviationPct: 8,
        createdAt: minsAgo(210),
        updatedAt: minsAgo(210),
      },
      {
        id: 'alert_008',
        tenantId: tenant.id,
        facilityId: 'fac_jhb_dc_01',
        assetId: 'asset_chl_01',
        severity: 'ADVISORY',
        status: 'ACTIVE',
        modelName: 'Sound Health Monitor',
        title: 'CHL-01: Acoustic Anomaly Detected',
        description: 'Mel-spectrogram autoencoder detected unusual acoustic signature.',
        createdAt: minsAgo(310),
        updatedAt: minsAgo(310),
      },
    ],
    skipDuplicates: true,
  })
}

/**
 * Deletes all operational data for a tenant (children first, FK-safe).
 * Keeps the tenant row and its users.
 */
export async function purgeTenantData(prisma: PrismaClient, tenantId: string): Promise<void> {
  await prisma.$transaction([
    prisma.healthScore.deleteMany({ where: { tenantId } }),
    prisma.alert.deleteMany({ where: { tenantId } }),
    prisma.energyBaseline.deleteMany({ where: { tenantId } }),
    prisma.esgScore.deleteMany({ where: { tenantId } }),
    prisma.esgReport.deleteMany({ where: { tenantId } }),
    prisma.waterUsage.deleteMany({ where: { tenantId } }),
    prisma.asset.deleteMany({ where: { tenantId } }),
    prisma.facility.deleteMany({ where: { tenantId } }),
  ])
}

/**
 * Copies the canonical demo scenario (facilities, assets, health scores,
 * active alerts) into another tenant with freshly generated ids.
 */
export async function copyScenarioInto(prisma: PrismaClient, targetTenantId: string): Promise<void> {
  const sourceFacilities = await prisma.facility.findMany({
    where: { tenantId: CANONICAL_DEMO_TENANT_ID },
    include: { assets: { include: { healthScores: true, alerts: true } } },
  })

  for (const facility of sourceFacilities) {
    const { id: sourceFacilityId, assets, ...facilityData } = facility
    const newFacility = await prisma.facility.create({
      data: { ...facilityData, tenantId: targetTenantId, metadata: facilityData.metadata ?? undefined },
    })

    for (const asset of assets) {
      const { id: sourceAssetId, healthScores, alerts, ...assetData } = asset
      const newAsset = await prisma.asset.create({
        data: {
          ...assetData,
          tenantId: targetTenantId,
          facilityId: newFacility.id,
          metadata: assetData.metadata ?? undefined,
        },
      })

      if (healthScores.length > 0) {
        await prisma.healthScore.createMany({
          data: healthScores.map(({ id, ...hs }) => ({
            ...hs,
            tenantId: targetTenantId,
            assetId: newAsset.id,
          })),
        })
      }

      if (alerts.length > 0) {
        await prisma.alert.createMany({
          data: alerts.map(({ id, ...alert }) => ({
            ...alert,
            tenantId: targetTenantId,
            facilityId: newFacility.id,
            assetId: newAsset.id,
          })),
        })
      }
    }

    // Facility-level alerts (no asset attached)
    const facilityAlerts = await prisma.alert.findMany({
      where: { tenantId: CANONICAL_DEMO_TENANT_ID, facilityId: sourceFacilityId, assetId: null },
    })
    if (facilityAlerts.length > 0) {
      await prisma.alert.createMany({
        data: facilityAlerts.map(({ id, ...alert }) => ({
          ...alert,
          tenantId: targetTenantId,
          facilityId: newFacility.id,
        })),
      })
    }
  }
}

/**
 * Restores a demo tenant to its pristine scenario state.
 * Canonical tenant re-runs the seed; cloned demo tenants re-copy from canonical.
 * Throws for non-demo tenants — never resets real customer data.
 */
export async function resetDemoTenant(prisma: PrismaClient, tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) throw new Error('Tenant not found')
  if (!tenant.isDemo) throw new Error('Refusing to reset a non-demo tenant')

  await purgeTenantData(prisma, tenantId)

  if (tenantId === CANONICAL_DEMO_TENANT_ID) {
    await seedDemoScenario(prisma)
  } else {
    await copyScenarioInto(prisma, tenantId)
  }
}

/**
 * Creates a new demo tenant populated with a copy of the canonical scenario.
 */
export async function cloneDemoTenant(
  prisma: PrismaClient,
  input: { name: string; slug: string; industry?: string }
): Promise<{ id: string; name: string; slug: string }> {
  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      slug: input.slug,
      industry: input.industry ?? 'Real Estate & Infrastructure',
      plan: 'trial',
      isDemo: true,
    },
  })
  await copyScenarioInto(prisma, tenant.id)
  return { id: tenant.id, name: tenant.name, slug: tenant.slug }
}
