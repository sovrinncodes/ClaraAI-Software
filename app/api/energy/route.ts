import { NextRequest, NextResponse } from 'next/server'
import { extractTenantFromHeaders } from '@/lib/utils/tenant'
import { getEnergyKpis } from '@/lib/db/queries/health-scores'
import { energyQuerySchema } from '@/lib/validation/schemas'
import { DEMO_FACILITIES } from '@/lib/data/seed'

const TARIFF_ZAR_PER_KWH = 1.5
const SA_GRID_FACTOR_KG_PER_KWH = 0.9006

// Generates a synthetic 15-min energy dataset for a facility with a given baseKw draw.
function buildSyntheticEnergyData(baseKw: number, days: number) {
  const intervals = days * 24 * 4 // 4 × 15-min per hour
  const now = new Date()
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0)
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  let totalKwh = 0
  let peakDemandKw = 0
  let peakDemandAt: string | null = null
  const chart: Array<{
    recordedAt: string
    actualKwh: number
    baselineKwh: number
    deviationPct: number
    anomalyFlag: boolean
  }> = []
  const anomalies: typeof chart = []

  for (let i = 0; i < intervals; i++) {
    const ts = new Date(start.getTime() + i * 15 * 60_000)
    const hour = ts.getUTCHours()
    const dayFactor = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.2 + 1.0
    const baselineKwh = (baseKw * 0.25 * dayFactor * 10) / 10
    // Deterministic noise via interval index (avoids random drift between calls)
    const noiseFactor = 1 + (((i * 7919) % 100) - 50) / 1000
    const actualKwh = Math.round(baselineKwh * noiseFactor * 100) / 100
    const deviationPct = Math.round(((actualKwh - baselineKwh) / baselineKwh) * 1000) / 10
    const anomalyFlag = Math.abs(deviationPct) > 5

    totalKwh += actualKwh
    const kw = actualKwh / 0.25
    if (kw > peakDemandKw) {
      peakDemandKw = kw
      peakDemandAt = ts.toISOString()
    }

    const row = { recordedAt: ts.toISOString(), actualKwh, baselineKwh, deviationPct, anomalyFlag }
    chart.push(row)
    if (anomalyFlag) anomalies.push(row)
  }

  const carbonTco2e = Math.round((totalKwh * SA_GRID_FACTOR_KG_PER_KWH) / 100) / 10
  const estimatedCostZar = Math.round(totalKwh * TARIFF_ZAR_PER_KWH)

  return {
    kpis: {
      totalKwh: Math.round(totalKwh * 10) / 10,
      peakDemandKw: Math.round(peakDemandKw * 10) / 10,
      peakDemandAt,
      carbonTco2e,
      estimatedCostZar,
    },
    chart,
    anomalies,
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = extractTenantFromHeaders(request.headers)
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const parsed = energyQuerySchema.safeParse({
      facilityId: searchParams.get('facilityId'),
      days: searchParams.get('days') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { facilityId, days } = parsed.data
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    const realData = await getEnergyKpis(tenantId, facilityId, start, end)

    if (realData) {
      return NextResponse.json({ success: true, data: realData })
    }

    // Synthetic fallback: derive base load from demo facility spec
    const demoFacility = DEMO_FACILITIES.find((f) => f.id === facilityId)
    const baseKw = demoFacility?.energyDrawKw ?? 1800
    const synthetic = buildSyntheticEnergyData(baseKw, days)

    return NextResponse.json({ success: true, data: synthetic })
  } catch (err) {
    console.error('[GET /api/energy]', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
