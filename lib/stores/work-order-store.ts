import { create } from 'zustand'
import type { WorkOrder, WorkOrderPart } from '@/types/work-order'

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-8924',
    title: 'Replace Cooling Loop B Filter',
    assetId: 'asset_crac_04',
    assetCode: 'CRAC-04',
    assetName: 'Cooling Unit D',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'High',
    status: 'In Progress',
    assigneeName: 'Sibusiso M.',
    assigneeAvatar: '/avatar_sipho.png',
    dueDate: 'Today, 18:00',
    description: 'Sudden pressure drop detected in cooling loop B of CRAC-04. Immediate inspection required to prevent thermal threshold breach.',
    tasks: [
      'Isolate cooling loop B and drain residual fluid.',
      'Inspect main filter housing for blockages or fractures.',
      'Replace filter element (Part #FLT-9022A).',
      'Re-pressurize and verify flow rate returns to baseline (120 L/min).'
    ],
    parts: [
      { partNumber: '#FLT-9022A', description: 'Filter Element', status: 'In Stock' }
    ],
    sourceAlert: {
      title: 'Cooling Loop Pressure Drop',
      time: 'Oct 24, 13:00 UTC',
      metric: 'Pressure: 2.1 bar'
    },
    createdAt: '2026-05-22T13:00:00Z',
    activityLog: [
      { timestamp: '14:30:12 UTC (Today)', title: 'Status updated to In Progress', subtitle: 'By Sibusiso M.' },
      { timestamp: '13:15:00 UTC (Today)', title: 'Assigned to Sibusiso M.', subtitle: 'By System Admin' },
      { timestamp: '13:00:05 UTC (Today)', title: 'Work Order Created', subtitle: 'Auto-generated from Alert ALR-8925 due to Critical Severity.' }
    ]
  },
  {
    id: 'WO-8923',
    title: 'Calibrate Z-Axis Vibro-Sensor',
    assetId: 'asset_chl_01',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'High',
    status: 'Open',
    assigneeName: 'Sibusiso M.',
    assigneeAvatar: '/avatar_sipho.png',
    dueDate: 'Tomorrow, 12:00',
    description: 'Recalibrate the vibration sensor on CHL-01 following repeated high vibration warnings.',
    tasks: [
      'Isolate CHL-01 from power supply.',
      'Inspect sensor mount and wire integrity.',
      'Run diagnostics calibration sequence.',
      'Restart and compare readings with master sensor.'
    ],
    createdAt: '2026-05-22T08:00:00Z',
    activityLog: [
      { timestamp: '08:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }
    ]
  },
  {
    id: 'WO-8919',
    title: 'Inspect Backup Generator Rings',
    assetId: 'asset_gen_02',
    assetCode: 'GEN-02',
    assetName: 'Backup Generator 2',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Medium',
    status: 'Open',
    assigneeName: 'Sibusiso M.',
    assigneeAvatar: '/avatar_sipho.png',
    dueDate: 'Oct 28, 2024',
    description: 'Visual inspection of generator slip rings and brushes to address voltage fluctuation warning.',
    tasks: [
      'Perform safety lockout/tagout.',
      'Remove generator housing panel.',
      'Measure brush length and inspect ring surfaces for pitting.',
      'Clean assembly and replace brushes if worn beyond 50%.'
    ],
    createdAt: '2026-05-21T10:00:00Z',
    activityLog: [
      { timestamp: '10:00:00 UTC (Yesterday)', title: 'Work Order Created', subtitle: 'By System Admin' }
    ]
  },
  {
    id: 'WO-8850',
    title: 'Routine HVAC Airflow Check',
    assetId: 'asset_ahu_12',
    assetCode: 'AHU-12',
    assetName: 'Air Handling Unit 12',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Low',
    status: 'Completed',
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    dueDate: 'Yesterday, 15:00',
    description: 'Routine check of airflow rates and filter pressure differentials.',
    tasks: [
      'Measure static pressure at air handling intake.',
      'Verify damper actuator functionality.',
      'Record airflow volume (m3/h) in data log.'
    ],
    createdAt: '2026-05-21T09:00:00Z',
    activityLog: [
      { timestamp: 'Yesterday, 16:30:00 UTC', title: 'Work Order Marked as Completed', subtitle: 'By Thabo Mokoena' },
      { timestamp: 'Yesterday, 15:00:00 UTC', title: 'Status updated to In Progress', subtitle: 'By Thabo Mokoena' },
      { timestamp: 'Yesterday, 09:00:00 UTC', title: 'Work Order Created', subtitle: 'By System Admin' }
    ]
  },
  {
    id: 'WO-8912',
    title: 'Compressor Fan Vibration Analysis',
    assetId: 'asset_crac_02',
    assetCode: 'CRAC-02',
    assetName: 'Cooling Unit B',
    facilityId: 'fac_cpt_mfg_01',
    facilityName: 'Cape Town Assembly',
    priority: 'High',
    status: 'Open',
    assigneeName: 'Unassigned',
    dueDate: 'Oct 29, 2024',
    description: 'Elevated vibration levels detected on CRAC-02 compressor fan. Perform diagnostic inspection.',
    tasks: ['Mount accelerometer on housing.', 'Record spectrum data.', 'Inspect mounting bolts.'],
    createdAt: '2026-05-22T02:00:00Z',
    activityLog: [{ timestamp: '02:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8911',
    title: 'PDU-01 Thermal Scan',
    assetId: 'asset_pdu_01',
    assetCode: 'PDU-01',
    assetName: 'Power Distribution Unit 1',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Medium',
    status: 'Open',
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    dueDate: 'Oct 30, 2024',
    description: 'Perform standard thermographic scan on main breaker panels.',
    tasks: ['Scan internal breakers.', 'Record temperature differentials.', 'Report hot spots.'],
    createdAt: '2026-05-22T04:00:00Z',
    activityLog: [{ timestamp: '04:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8910',
    title: 'UPS-B Cell Capacity Check',
    assetId: 'asset_ups_b',
    assetCode: 'UPS-B',
    assetName: 'Secondary Battery Bank',
    facilityId: 'fac_cpt_mfg_01',
    facilityName: 'Cape Town Assembly',
    priority: 'Medium',
    status: 'Pending Parts',
    assigneeName: 'Unassigned',
    dueDate: 'Nov 02, 2024',
    description: 'Run discharge test on cell bank C to inspect potential degradation.',
    tasks: ['Isolate string C.', 'Connect load bank.', 'Monitor voltage curve.'],
    createdAt: '2026-05-21T14:00:00Z',
    activityLog: [{ timestamp: '14:00:00 UTC (Yesterday)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8909',
    title: 'AHU-03 Filter Replacement',
    assetId: 'asset_ahu_03',
    assetCode: 'AHU-03',
    assetName: 'Air Handling Unit 3',
    facilityId: 'fac_pta_hq_01',
    facilityName: 'Pretoria HQ',
    priority: 'Low',
    status: 'Open',
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    dueDate: 'Nov 03, 2024',
    description: 'Scheduled quarterly intake and exhaust filter bag replacement.',
    tasks: ['Shut down AHU.', 'Remove dirty filter packs.', 'Vacuum housing.', 'Install new MERV-13 bags.'],
    createdAt: '2026-05-22T05:00:00Z',
    activityLog: [{ timestamp: '05:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8908',
    title: 'GEN-01 Fuel Water Separator Change',
    assetId: 'asset_gen_01',
    assetCode: 'GEN-01',
    assetName: 'Backup Generator',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Low',
    status: 'In Progress',
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    dueDate: 'Nov 04, 2024',
    description: 'Water detected in fuel pre-filter. Drain bowl and replace filter element.',
    tasks: ['Isolate fuel supply line.', 'Drain water separator bowl.', 'Replace element.', 'Prime system.'],
    createdAt: '2026-05-22T06:00:00Z',
    activityLog: [{ timestamp: '06:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8907',
    title: 'CRAC-01 Belt Tightening',
    assetId: 'asset_crac_01',
    assetCode: 'CRAC-01',
    assetName: 'Cooling Unit A',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Low',
    status: 'Open',
    assigneeName: 'Unassigned',
    dueDate: 'Nov 05, 2024',
    description: 'Inspect belt deflection on primary fan motor and adjust tensioning.',
    tasks: ['Shut off CRAC unit.', 'Inspect belt wear.', 'Adjust tension bolt.'],
    createdAt: '2026-05-22T07:00:00Z',
    activityLog: [{ timestamp: '07:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8906',
    title: 'UPS-A Terminal Inspection',
    assetId: 'asset_ups_a',
    assetCode: 'UPS-A',
    assetName: 'Primary Battery Bank',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Medium',
    status: 'Open',
    assigneeName: 'Sibusiso M.',
    assigneeAvatar: '/avatar_sipho.png',
    dueDate: 'Nov 06, 2024',
    description: 'Clean battery posts and check terminal torque settings.',
    tasks: ['Perform thermal scan of connections.', 'Torque loose connectors.', 'Apply protective grease.'],
    createdAt: '2026-05-22T09:00:00Z',
    activityLog: [{ timestamp: '09:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8905',
    title: 'Chilled Water Pump Seal Check',
    assetId: 'asset_chl_05',
    assetCode: 'CHL-05',
    assetName: 'Condenser Pump A',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Low',
    status: 'Open',
    assigneeName: 'Unassigned',
    dueDate: 'Nov 07, 2024',
    description: 'Minor moisture build-up detected near pump drive shaft seal. Monitor leakage rate.',
    tasks: ['Measure leakage drops/min.', 'Inspect gland packing.', 'Clean motor base.'],
    createdAt: '2026-05-22T10:00:00Z',
    activityLog: [{ timestamp: '10:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  },
  {
    id: 'WO-8904',
    title: 'CRAC-10 Return Air Sensor Check',
    assetId: 'asset_crac_10',
    assetCode: 'CRAC-10',
    assetName: 'Cooling Unit J',
    facilityId: 'fac_jhb_dc_01',
    facilityName: 'Johannesburg DC-1',
    priority: 'Low',
    status: 'Open',
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    dueDate: 'Nov 08, 2024',
    description: 'Recalibrate air temperature sensor after transient reading spikes.',
    tasks: ['Locate sensor.', 'Verify wiring connectivity.', 'Compare readings with secondary thermometer.'],
    createdAt: '2026-05-22T11:00:00Z',
    activityLog: [{ timestamp: '11:00:00 UTC (Today)', title: 'Work Order Created', subtitle: 'By System Admin' }]
  }
]

interface WorkOrderStore {
  workOrders: WorkOrder[]
  openCount: number
  highPriorityCount: number

  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt' | 'activityLog'>) => void
  markComplete: (id: string, userName?: string) => void
  updatePartStatus: (woId: string, partNumber: string, status: WorkOrderPart['status']) => void
}

export const useWorkOrderStore = create<WorkOrderStore>((set, get) => {
  const openCount = INITIAL_WORK_ORDERS.filter((w) => w.status !== 'Completed').length
  const highPriorityCount = INITIAL_WORK_ORDERS.filter(
    (w) => w.status !== 'Completed' && (w.priority === 'High' || w.priority === 'Critical')
  ).length

  return {
    workOrders: INITIAL_WORK_ORDERS,
    openCount,
    highPriorityCount,

    addWorkOrder: (newWo) => {
      set((state) => {
        const nextIdNumber = Math.max(...state.workOrders.map((w) => parseInt(w.id.replace('WO-', '')))) + 1
        const id = `WO-${nextIdNumber}`
        const dateStr = new Date().toISOString()
        
        const fullWo: WorkOrder = {
          ...newWo,
          id,
          createdAt: dateStr,
          activityLog: [
            {
              timestamp: `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}:00 UTC (Today)`,
              title: 'Work Order Created',
              subtitle: `Assigned to ${newWo.assigneeName || 'Unassigned'}`
            }
          ]
        }

        const nextList = [fullWo, ...state.workOrders]
        const nextOpen = nextList.filter((w) => w.status !== 'Completed').length
        const nextHigh = nextList.filter(
          (w) => w.status !== 'Completed' && (w.priority === 'High' || w.priority === 'Critical')
        ).length

        return {
          workOrders: nextList,
          openCount: nextOpen,
          highPriorityCount: nextHigh
        }
      })
    },

    markComplete: (id, userName = 'Technician') => {
      set((state) => {
        const timeStr = `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}:00 UTC (Today)`
        const nextList = state.workOrders.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              status: 'Completed' as const,
              activityLog: [
                {
                  timestamp: timeStr,
                  title: 'Work Order Marked as Completed',
                  subtitle: `By ${userName}`
                },
                ...w.activityLog
              ]
            }
          }
          return w
        })

        const nextOpen = nextList.filter((w) => w.status !== 'Completed').length
        const nextHigh = nextList.filter(
          (w) => w.status !== 'Completed' && (w.priority === 'High' || w.priority === 'Critical')
        ).length

        return {
          workOrders: nextList,
          openCount: nextOpen,
          highPriorityCount: nextHigh
        }
      })
    },

    updatePartStatus: (woId, partNumber, status) => {
      set((state) => {
        const nextList = state.workOrders.map((w) => {
          if (w.id === woId && w.parts) {
            return {
              ...w,
              parts: w.parts.map((p) => (p.partNumber === partNumber ? { ...p, status } : p))
            }
          }
          return w
        })
        return { workOrders: nextList }
      })
    }
  }
})
