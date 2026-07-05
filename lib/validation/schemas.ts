import { z } from 'zod'

export const alertActionSchema = z.object({
  alertId: z.string().min(1, 'alertId is required'),
  action: z.enum(['acknowledge', 'resolve']),
})

export const esgReportGenerateSchema = z.object({
  facilityId: z.string().min(1, 'facilityId is required'),
  framework: z.enum(['GRI_302', 'GRI_303', 'GRI_305', 'GHG_PROTOCOL', 'ISO_50001']),
  periodStart: z.string().datetime({ message: 'periodStart must be an ISO 8601 datetime' }),
  periodEnd: z.string().datetime({ message: 'periodEnd must be an ISO 8601 datetime' }),
  reportName: z.string().optional(),
})

export const esgScoreQuerySchema = z.object({
  facilityId: z.string().optional(),
  refresh: z.enum(['true', 'false']).optional(),
})

export const energyQuerySchema = z.object({
  facilityId: z.string().min(1, 'facilityId is required'),
  days: z.coerce.number().int().min(1).max(90).optional().default(7),
})

export const portfolioKpisQuerySchema = z.object({
  facilityId: z.string().optional(),
})

export type AlertAction = z.infer<typeof alertActionSchema>
export type EsgReportGenerateInput = z.infer<typeof esgReportGenerateSchema>
export type EsgScoreQuery = z.infer<typeof esgScoreQuerySchema>
export type EnergyQuery = z.infer<typeof energyQuerySchema>
