'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Briefcase,
  Shield,
  FileSpreadsheet,
  Settings2,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  MoreVertical,
  Cpu,
  User,
  Search,
  ChevronDown,
  Check,
  Plus,
  Snowflake,
  Wind,
  Gauge,
  Database,
  Leaf
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { cn } from '@/lib/utils/cn'
import { getHealthColor } from '@/lib/utils/format'
import { DEMO_FACILITIES } from '@/lib/data/seed'

export interface WorkOrder {
  id: string
  assetCode: string
  description: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Completed' | 'Pending Parts'
  assigneeName: string
  assigneeAvatar?: string
  dueDate: string
  dueDateIsTodayOverdue?: boolean
}

export const DEMO_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-1042',
    assetCode: 'CRAC-01',
    description: 'Replace primary cooling filters and check coolant levels',
    priority: 'High',
    status: 'Open',
    assigneeName: 'N. Mkhize',
    dueDate: 'Today, 17:00',
    dueDateIsTodayOverdue: true
  },
  {
    id: 'WO-1038',
    assetCode: 'CHL-01',
    description: 'Vibration anomaly investigation and bearing check',
    priority: 'Critical',
    status: 'In Progress',
    assigneeName: 'D. Mbeka',
    dueDate: 'Tomorrow, 12:00'
  },
  {
    id: 'WO-1035',
    assetCode: 'UPS-A',
    description: 'Quarterly battery health check and terminal cleaning',
    priority: 'Medium',
    status: 'Completed',
    assigneeName: 'N. Mkhize',
    dueDate: 'Yesterday, 16:00'
  },
  {
    id: 'WO-1031',
    assetCode: 'GEN-02',
    description: 'Oil change and routine generator load test',
    priority: 'Low',
    status: 'Pending Parts',
    assigneeName: 'T. Baloyi',
    dueDate: 'Oct 15, 09:00'
  },
  {
    id: 'WO-1028',
    assetCode: 'AHU-04',
    description: 'Belt replacement and motor alignment',
    priority: 'Medium',
    status: 'Open',
    assigneeName: 'Unassigned',
    dueDate: 'Oct 16, 14:00'
  },
  {
    id: 'WO-1025',
    assetCode: 'CRAC-02',
    description: 'Compressor thermal overload diagnosis',
    priority: 'High',
    status: 'Open',
    assigneeName: 'D. Mbeka',
    dueDate: 'Oct 18, 10:00'
  },
  {
    id: 'WO-1024',
    assetCode: 'PDU-01',
    description: 'Sub-breaker inspection and terminal tightening',
    priority: 'Low',
    status: 'Completed',
    assigneeName: 'T. Baloyi',
    dueDate: 'Oct 19, 11:30'
  },
  {
    id: 'WO-1021',
    assetCode: 'UPS-B',
    description: 'Battery cell impedance testing and calibration',
    priority: 'Medium',
    status: 'In Progress',
    assigneeName: 'N. Mkhize',
    dueDate: 'Oct 20, 15:00'
  },
  {
    id: 'WO-1019',
    assetCode: 'CHL-02',
    description: 'Condenser tube descaling and leak inspection',
    priority: 'High',
    status: 'Pending Parts',
    assigneeName: 'D. Mbeka',
    dueDate: 'Oct 21, 08:00'
  },
  {
    id: 'WO-1018',
    assetCode: 'AHU-02',
    description: 'Filter rack latch repairs and seal verification',
    priority: 'Medium',
    status: 'Open',
    assigneeName: 'Unassigned',
    dueDate: 'Oct 22, 13:00'
  },
  {
    id: 'WO-1015',
    assetCode: 'GEN-01',
    description: 'Fuel water separator element replacement',
    priority: 'Low',
    status: 'Open',
    assigneeName: 'T. Baloyi',
    dueDate: 'Oct 23, 16:00'
  },
  {
    id: 'WO-1012',
    assetCode: 'CRAC-03',
    description: 'Expansion valve configuration and pressure test',
    priority: 'Medium',
    status: 'Completed',
    assigneeName: 'N. Mkhize',
    dueDate: 'Oct 24, 10:00'
  }
]

export interface FacilityAlert {
  id: string
  severity: 'CRITICAL' | 'WARNING' | 'INFO'
  description: string
  subDescription?: string
  assetCode: string
  assetName: string
  metric: string
  status: 'Active' | 'Acknowledged' | 'Resolved'
  timestamp: string
  showInActiveLog?: boolean
}

export const DEMO_ALERTS: FacilityAlert[] = [
  {
    id: 'AL-1001',
    severity: 'CRITICAL',
    description: 'Bearing vibration exceeded 15mm/s',
    subDescription: 'Predicted failure: < 48 hours',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    metric: '18.2 mm/s',
    status: 'Active',
    timestamp: 'Today, 08:14 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1002',
    severity: 'WARNING',
    description: 'Return air temp above setpoint',
    subDescription: 'Duration: 45 mins',
    assetCode: 'CRAC-03',
    assetName: 'Cooling Unit C',
    metric: '26.5 °C',
    status: 'Active',
    timestamp: 'Today, 06:30 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1003',
    severity: 'WARNING',
    description: 'Filter pressure drop high',
    subDescription: 'Maintenance recommended',
    assetCode: 'AHU-02',
    assetName: 'Air Handling',
    metric: '350 Pa',
    status: 'Acknowledged',
    timestamp: 'Yesterday, 18:45 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1004',
    severity: 'INFO',
    description: 'PUE ratio crossed 1.30 target',
    subDescription: 'Peak load period',
    assetCode: 'JHB-DC-01',
    assetName: 'Facility Level',
    metric: '1.32',
    status: 'Resolved',
    timestamp: 'Yesterday, 14:15 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1005',
    severity: 'WARNING',
    description: 'UPS-A load imbalance detected',
    subDescription: 'Phase B overload',
    assetCode: 'UPS-A',
    assetName: 'Battery Bank',
    metric: '15% delta',
    status: 'Resolved',
    timestamp: 'Oct 24, 11:00 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1006',
    severity: 'CRITICAL',
    description: 'Cooling loop pressure drop',
    subDescription: 'Potential leak detected',
    assetCode: 'CHL-02',
    assetName: 'Backup Chiller',
    metric: '2.1 bar',
    status: 'Resolved',
    timestamp: 'Oct 22, 09:38 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1007',
    severity: 'WARNING',
    description: 'Condenser water temp high',
    subDescription: 'Flow rate fluctuation',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    metric: '29.1 °C',
    status: 'Resolved',
    timestamp: 'Oct 21, 14:20 PM'
  },
  {
    id: 'AL-1008',
    severity: 'INFO',
    description: 'PDU-01 breaker load test',
    subDescription: 'Scheduled monthly check',
    assetCode: 'PDU-01',
    assetName: 'Power Dist. 1',
    metric: 'Optimal',
    status: 'Resolved',
    timestamp: 'Oct 20, 10:00 AM'
  },
  {
    id: 'AL-1009',
    severity: 'WARNING',
    description: 'Humidifier cylinder wear',
    subDescription: 'Replacement scheduled',
    assetCode: 'AHU-01',
    assetName: 'Air Handling',
    metric: '85% wear',
    status: 'Acknowledged',
    timestamp: 'Oct 19, 15:30 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1010',
    severity: 'CRITICAL',
    description: 'UPS-B battery cell temp high',
    subDescription: 'Thermal runaway warning',
    assetCode: 'UPS-B',
    assetName: 'Secondary Battery',
    metric: '42.5 °C',
    status: 'Active',
    timestamp: 'Oct 19, 09:12 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1011',
    severity: 'WARNING',
    description: 'Return air sensor fault',
    subDescription: 'Loss of sensor communication',
    assetCode: 'CRAC-01',
    assetName: 'Cooling Unit A',
    metric: 'N/A',
    status: 'Acknowledged',
    timestamp: 'Oct 18, 16:45 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1012',
    severity: 'INFO',
    description: 'Compressor motor start cycle',
    subDescription: 'High starting current peak',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    metric: '120 A',
    status: 'Resolved',
    timestamp: 'Oct 18, 11:24 AM'
  },
  {
    id: 'AL-1013',
    severity: 'WARNING',
    description: 'Fuel day tank low level',
    subDescription: 'Reserve capacity active',
    assetCode: 'GEN-01',
    assetName: 'Backup Gen 1',
    metric: '15%',
    status: 'Resolved',
    timestamp: 'Oct 17, 13:50 PM'
  },
  {
    id: 'AL-1014',
    severity: 'CRITICAL',
    description: 'Supply fan vibration anomaly',
    subDescription: 'Fan belt wear suspected',
    assetCode: 'AHU-02',
    assetName: 'Air Handling',
    metric: '6.2 mm/s',
    status: 'Active',
    timestamp: 'Oct 16, 22:30 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1015',
    severity: 'WARNING',
    description: 'Condensation tray overflow',
    subDescription: 'Drain line blockage',
    assetCode: 'CRAC-02',
    assetName: 'Cooling Unit B',
    metric: 'High Level',
    status: 'Active',
    timestamp: 'Oct 16, 14:15 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1016',
    severity: 'INFO',
    description: 'UPS-A test cycle complete',
    subDescription: 'All systems nominal',
    assetCode: 'UPS-A',
    assetName: 'Battery Bank',
    metric: 'Passed',
    status: 'Resolved',
    timestamp: 'Oct 15, 17:00 PM'
  },
  {
    id: 'AL-1017',
    severity: 'WARNING',
    description: 'PUE ratio crossed 1.25 limit',
    subDescription: 'Elevated cooling load',
    assetCode: 'JHB-DC-01',
    assetName: 'Facility Level',
    metric: '1.27',
    status: 'Resolved',
    timestamp: 'Oct 15, 08:30 AM'
  },
  {
    id: 'AL-1018',
    severity: 'CRITICAL',
    description: 'Low refrigerant pressure',
    subDescription: 'Leak suspected in coil B',
    assetCode: 'CHL-02',
    assetName: 'Backup Chiller',
    metric: '1.4 bar',
    status: 'Acknowledged',
    timestamp: 'Oct 14, 19:10 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1019',
    severity: 'INFO',
    description: 'Supply air temp calibrated',
    subDescription: 'Maintenance adjustment',
    assetCode: 'AHU-04',
    assetName: 'Air Handling',
    metric: '16.1 °C',
    status: 'Resolved',
    timestamp: 'Oct 14, 11:00 AM'
  },
  {
    id: 'AL-1020',
    severity: 'WARNING',
    description: 'Neutral current high',
    subDescription: 'Harmonic distortion detected',
    assetCode: 'PDU-01',
    assetName: 'Power Dist. 1',
    metric: '45 A',
    status: 'Resolved',
    timestamp: 'Oct 13, 10:45 AM'
  },
  {
    id: 'AL-1021',
    severity: 'WARNING',
    description: 'Fan motor high temperature',
    subDescription: 'Bearing lubrication needed',
    assetCode: 'CRAC-05',
    assetName: 'Cooling Unit E',
    metric: '78 °C',
    status: 'Resolved',
    timestamp: 'Oct 12, 16:30 PM'
  },
  {
    id: 'AL-1022',
    severity: 'INFO',
    description: 'Main power disconnect test',
    subDescription: 'Battery backup engaged',
    assetCode: 'UPS-B',
    assetName: 'Secondary Battery',
    metric: 'Active',
    status: 'Resolved',
    timestamp: 'Oct 12, 09:00 AM'
  },
  {
    id: 'AL-1023',
    severity: 'WARNING',
    description: 'Oil differential pressure low',
    subDescription: 'Filter change recommended',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    metric: '1.1 bar',
    status: 'Resolved',
    timestamp: 'Oct 11, 23:45 PM'
  },
  {
    id: 'AL-1024',
    severity: 'WARNING',
    description: 'Static pressure high',
    subDescription: 'Dampers out of alignment',
    assetCode: 'AHU-03',
    assetName: 'Air Handling',
    metric: '420 Pa',
    status: 'Resolved',
    timestamp: 'Oct 11, 14:20 PM'
  },
  {
    id: 'AL-1025',
    severity: 'INFO',
    description: 'Reheat stage 1 active',
    subDescription: 'Dehumidification mode',
    assetCode: 'CRAC-04',
    assetName: 'Cooling Unit D',
    metric: 'Active',
    status: 'Resolved',
    timestamp: 'Oct 10, 18:30 PM'
  },
  {
    id: 'AL-1026',
    severity: 'WARNING',
    description: 'Engine block heater fault',
    subDescription: 'Cold start risk',
    assetCode: 'GEN-01',
    assetName: 'Backup Gen 1',
    metric: 'Fault',
    status: 'Acknowledged',
    timestamp: 'Oct 10, 08:15 AM',
    showInActiveLog: true
  },
  {
    id: 'AL-1027',
    severity: 'WARNING',
    description: 'Bypass mode active',
    subDescription: 'Maintenance bypass switch on',
    assetCode: 'UPS-A',
    assetName: 'Battery Bank',
    metric: 'Active',
    status: 'Active',
    timestamp: 'Oct 09, 17:40 PM',
    showInActiveLog: true
  },
  {
    id: 'AL-1028',
    severity: 'INFO',
    description: 'Grid power fluctuation',
    subDescription: 'Sag detected on line 1',
    assetCode: 'JHB-DC-01',
    assetName: 'Facility Level',
    metric: '380 V',
    status: 'Resolved',
    timestamp: 'Oct 09, 12:10 PM'
  },
  {
    id: 'AL-1029',
    severity: 'WARNING',
    description: 'Condenser fan 3 fault',
    subDescription: 'Motor overload tripped',
    assetCode: 'CHL-02',
    assetName: 'Backup Chiller',
    metric: 'Tripped',
    status: 'Resolved',
    timestamp: 'Oct 08, 19:25 PM'
  },
  {
    id: 'AL-1030',
    severity: 'CRITICAL',
    description: 'Static pressure loss',
    subDescription: 'Supply fan belt broken',
    assetCode: 'AHU-01',
    assetName: 'Air Handling',
    metric: '0 Pa',
    status: 'Resolved',
    timestamp: 'Oct 08, 08:45 AM'
  },
  {
    id: 'AL-1031',
    severity: 'WARNING',
    description: 'Liquid line temp high',
    subDescription: 'Low subcooling detected',
    assetCode: 'CRAC-07',
    assetName: 'Cooling Unit G',
    metric: '48 °C',
    status: 'Resolved',
    timestamp: 'Oct 07, 16:20 PM'
  },
  {
    id: 'AL-1032',
    severity: 'INFO',
    description: 'Inverter phase sync complete',
    subDescription: 'Back to grid mode',
    assetCode: 'UPS-B',
    assetName: 'Secondary Battery',
    metric: 'Synced',
    status: 'Resolved',
    timestamp: 'Oct 07, 10:30 AM'
  },
  {
    id: 'AL-1033',
    severity: 'WARNING',
    description: 'Cabinet temp elevated',
    subDescription: 'Intake filter clogged',
    assetCode: 'PDU-01',
    assetName: 'Power Dist. 1',
    metric: '38.5 °C',
    status: 'Resolved',
    timestamp: 'Oct 06, 15:40 PM'
  },
  {
    id: 'AL-1034',
    severity: 'WARNING',
    description: 'Chilled water flow low',
    subDescription: 'Valve actuator issue',
    assetCode: 'CHL-01',
    assetName: 'Main Chiller',
    metric: '12 L/s',
    status: 'Resolved',
    timestamp: 'Oct 06, 09:15 AM'
  },
  {
    id: 'AL-1035',
    severity: 'INFO',
    description: 'Filter differential reset',
    subDescription: 'Air filters replaced',
    assetCode: 'AHU-02',
    assetName: 'Air Handling',
    metric: '50 Pa',
    status: 'Resolved',
    timestamp: 'Oct 05, 14:00 PM'
  },
  {
    id: 'AL-1036',
    severity: 'WARNING',
    description: 'Compressor discharge temp high',
    subDescription: 'High head pressure',
    assetCode: 'CRAC-06',
    assetName: 'Cooling Unit F',
    metric: '92 °C',
    status: 'Resolved',
    timestamp: 'Oct 05, 08:30 AM'
  },
  {
    id: 'AL-1037',
    severity: 'CRITICAL',
    description: 'Battery charger failure',
    subDescription: 'Starting battery critical',
    assetCode: 'GEN-02',
    assetName: 'Backup Gen 2',
    metric: '11.2 V',
    status: 'Resolved',
    timestamp: 'Oct 04, 19:45 PM'
  },
  {
    id: 'AL-1038',
    severity: 'WARNING',
    description: 'DC link voltage deviation',
    subDescription: 'Battery bank cell check needed',
    assetCode: 'UPS-A',
    assetName: 'Battery Bank',
    metric: '412 V',
    status: 'Resolved',
    timestamp: 'Oct 04, 11:15 AM'
  },
  {
    id: 'AL-1039',
    severity: 'INFO',
    description: 'Daily PUE baseline sync',
    subDescription: 'Model parameters updated',
    assetCode: 'JHB-DC-01',
    assetName: 'Facility Level',
    metric: '1.23',
    status: 'Resolved',
    timestamp: 'Oct 03, 23:59 PM'
  },
  {
    id: 'AL-1040',
    severity: 'WARNING',
    description: 'Evaporator water temp low',
    subDescription: 'Freeze protection warning',
    assetCode: 'CHL-02',
    assetName: 'Backup Chiller',
    metric: '3.8 °C',
    status: 'Resolved',
    timestamp: 'Oct 03, 15:20 PM'
  },
  {
    id: 'AL-1041',
    severity: 'WARNING',
    description: 'Mixed air temp deviation',
    subDescription: 'Outdoor damper stuck',
    assetCode: 'AHU-04',
    assetName: 'Air Handling',
    metric: '19.5 °C',
    status: 'Resolved',
    timestamp: 'Oct 02, 10:45 AM'
  },
  {
    id: 'AL-1042',
    severity: 'INFO',
    description: 'Fan control loop tune',
    subDescription: 'PID parameters adjusted',
    assetCode: 'CRAC-08',
    assetName: 'Cooling Unit H',
    metric: 'Tuned',
    status: 'Resolved',
    timestamp: 'Oct 02, 09:00 AM'
  }
]

export interface AssetDataExtended {
  id: string
  name: string
  sub: string
  category: 'HVAC' | 'Cooling' | 'Power' | 'Airflow'
  status: 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL' | 'STANDBY'
  health: number
  load: string
  lastSync: string
  activeAlerts: string
}

export const JHB_DC_01_ALL_ASSETS: AssetDataExtended[] = [
  { id: 'asset_crac_01', name: 'CRAC-01', sub: 'Cooling Unit A', category: 'HVAC', status: 'OPTIMAL', health: 98.5, load: '12.4 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_crac_02', name: 'CRAC-02', sub: 'Cooling Unit B', category: 'HVAC', status: 'OPTIMAL', health: 94.2, load: '14.1 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_crac_03', name: 'CRAC-03', sub: 'Cooling Unit C', category: 'HVAC', status: 'OPTIMAL', health: 92.8, load: '13.5 kW', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_chl_01', name: 'CHL-01', sub: 'Main Chiller', category: 'Cooling', status: 'ADVISORY', health: 82.1, load: '45.2 kW', lastSync: '14:02:45', activeAlerts: '1 Advisory' },
  { id: 'asset_chl_02', name: 'CHL-02', sub: 'Backup Chiller', category: 'Cooling', status: 'STANDBY', health: 99.9, load: '0.5 kW', lastSync: '14:02:30', activeAlerts: '-' },
  { id: 'asset_ups_a', name: 'UPS-A', sub: 'Primary Battery Bank', category: 'Power', status: 'OPTIMAL', health: 99.5, load: '45% Load', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_ups_b', name: 'UPS-B', sub: 'Secondary Battery Bank', category: 'Power', status: 'OPTIMAL', health: 99.2, load: '42% Load', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_gen_01', name: 'GEN-01', sub: 'Backup Generator', category: 'Power', status: 'CRITICAL', health: 65.0, load: '0 kW', lastSync: '14:02:40', activeAlerts: '1 Critical' },
  { id: 'asset_ahu_01', name: 'AHU-01', sub: 'Air Handling Unit 1', category: 'Airflow', status: 'OPTIMAL', health: 91.4, load: '5.2 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_pdu_01', name: 'PDU-01', sub: 'Power Distribution Unit 1', category: 'Power', status: 'OPTIMAL', health: 98.9, load: '220 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_crac_04', name: 'CRAC-04', sub: 'Cooling Unit D', category: 'HVAC', status: 'OPTIMAL', health: 97.4, load: '12.8 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_crac_05', name: 'CRAC-05', sub: 'Cooling Unit E', category: 'HVAC', status: 'OPTIMAL', health: 96.1, load: '13.0 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_crac_06', name: 'CRAC-06', sub: 'Cooling Unit F', category: 'HVAC', status: 'OPTIMAL', health: 95.5, load: '12.9 kW', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_crac_07', name: 'CRAC-07', sub: 'Cooling Unit G', category: 'HVAC', status: 'OPTIMAL', health: 94.8, load: '13.2 kW', lastSync: '14:02:43', activeAlerts: '-' },
  { id: 'asset_crac_08', name: 'CRAC-08', sub: 'Cooling Unit H', category: 'HVAC', status: 'OPTIMAL', health: 93.9, load: '13.1 kW', lastSync: '14:02:42', activeAlerts: '-' },
  { id: 'asset_crac_09', name: 'CRAC-09', sub: 'Cooling Unit I', category: 'HVAC', status: 'OPTIMAL', health: 92.5, load: '12.7 kW', lastSync: '14:02:41', activeAlerts: '-' },
  { id: 'asset_crac_10', name: 'CRAC-10', sub: 'Cooling Unit J', category: 'HVAC', status: 'WATCH', health: 87.2, load: '14.5 kW', lastSync: '14:02:40', activeAlerts: '1 Watch' },
  { id: 'asset_crac_11', name: 'CRAC-11', sub: 'Cooling Unit K', category: 'HVAC', status: 'OPTIMAL', health: 95.0, load: '13.0 kW', lastSync: '14:02:39', activeAlerts: '-' },
  { id: 'asset_crac_12', name: 'CRAC-12', sub: 'Cooling Unit L', category: 'HVAC', status: 'OPTIMAL', health: 94.3, load: '13.4 kW', lastSync: '14:02:38', activeAlerts: '-' },
  { id: 'asset_chl_03', name: 'CHL-03', sub: 'Auxiliary Chiller A', category: 'Cooling', status: 'OPTIMAL', health: 96.8, load: '40.5 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_chl_04', name: 'CHL-04', sub: 'Auxiliary Chiller B', category: 'Cooling', status: 'OPTIMAL', health: 95.2, load: '41.0 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_chl_05', name: 'CHL-05', sub: 'Condenser Pump A', category: 'Cooling', status: 'OPTIMAL', health: 93.4, load: '15.2 kW', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_chl_06', name: 'CHL-06', sub: 'Condenser Pump B', category: 'Cooling', status: 'ADVISORY', health: 81.5, load: '18.4 kW', lastSync: '14:02:43', activeAlerts: '1 Advisory' },
  { id: 'asset_ups_c', name: 'UPS-C', sub: 'Row Battery A1', category: 'Power', status: 'OPTIMAL', health: 98.4, load: '35% Load', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_ups_d', name: 'UPS-D', sub: 'Row Battery A2', category: 'Power', status: 'OPTIMAL', health: 98.1, load: '32% Load', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_ups_e', name: 'UPS-E', sub: 'Row Battery B1', category: 'Power', status: 'OPTIMAL', health: 97.9, load: '38% Load', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_ups_f', name: 'UPS-f', sub: 'Row Battery B2', category: 'Power', status: 'OPTIMAL', health: 97.5, load: '36% Load', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_ups_g', name: 'UPS-G', sub: 'Row Battery C1', category: 'Power', status: 'OPTIMAL', health: 96.8, load: '40% Load', lastSync: '14:02:43', activeAlerts: '-' },
  { id: 'asset_ups_h', name: 'UPS-H', sub: 'Row Battery C2', category: 'Power', status: 'ADVISORY', health: 78.6, load: '48% Load', lastSync: '14:02:42', activeAlerts: '1 Advisory' },
  { id: 'asset_gen_02', name: 'GEN-02', sub: 'Backup Generator 2', category: 'Power', status: 'STANDBY', health: 99.1, load: '0 kW', lastSync: '14:02:30', activeAlerts: '-' },
  { id: 'asset_gen_03', name: 'GEN-03', sub: 'Backup Generator 3', category: 'Power', status: 'STANDBY', health: 98.7, load: '0 kW', lastSync: '14:02:30', activeAlerts: '-' },
  { id: 'asset_gen_04', name: 'GEN-04', sub: 'Backup Generator 4', category: 'Power', status: 'STANDBY', health: 98.5, load: '0 kW', lastSync: '14:02:30', activeAlerts: '-' },
  { id: 'asset_ahu_02', name: 'AHU-02', sub: 'Air Handling Unit 2', category: 'Airflow', status: 'OPTIMAL', health: 92.5, load: '5.0 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_ahu_03', name: 'AHU-03', sub: 'Air Handling Unit 3', category: 'Airflow', status: 'ADVISORY', health: 84.0, load: '8.7 kW', lastSync: '14:02:45', activeAlerts: '1 Advisory' },
  { id: 'asset_ahu_04', name: 'AHU-04', sub: 'Air Handling Unit 4', category: 'Airflow', status: 'OPTIMAL', health: 93.1, load: '5.1 kW', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_ahu_05', name: 'AHU-05', sub: 'Air Handling Unit 5', category: 'Airflow', status: 'OPTIMAL', health: 91.8, load: '5.3 kW', lastSync: '14:02:44', activeAlerts: '-' },
  { id: 'asset_ahu_06', name: 'AHU-06', sub: 'Air Handling Unit 6', category: 'Airflow', status: 'OPTIMAL', health: 92.0, load: '5.2 kW', lastSync: '14:02:43', activeAlerts: '-' },
  { id: 'asset_ahu_07', name: 'AHU-07', sub: 'Air Handling Unit 7', category: 'Airflow', status: 'OPTIMAL', health: 90.9, load: '5.4 kW', lastSync: '14:02:42', activeAlerts: '-' },
  { id: 'asset_ahu_08', name: 'AHU-08', sub: 'Air Handling Unit 8', category: 'Airflow', status: 'OPTIMAL', health: 91.2, load: '5.1 kW', lastSync: '14:02:41', activeAlerts: '-' },
  { id: 'asset_pdu_02', name: 'PDU-02', sub: 'Power Distribution Unit 2', category: 'Power', status: 'OPTIMAL', health: 99.0, load: '215 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_pdu_03', name: 'PDU-03', sub: 'Power Distribution Unit 3', category: 'Power', status: 'OPTIMAL', health: 98.5, load: '230 kW', lastSync: '14:02:45', activeAlerts: '-' },
  { id: 'asset_pdu_04', name: 'PDU-04', sub: 'Power Distribution Unit 4', category: 'Power', status: 'OPTIMAL', health: 98.7, load: '225 kW', lastSync: '14:02:44', activeAlerts: '-' }
]

export const getAssetsForFacility = (facId: string): AssetDataExtended[] => {
  if (facId === 'fac_jhb_dc_01') {
    return JHB_DC_01_ALL_ASSETS
  }
  const baseAssets = JHB_DC_01_ALL_ASSETS
  if (facId === 'fac_cpt_mfg_01') {
    const list: AssetDataExtended[] = []
    for (let i = 0; i < 120; i++) {
      const base = baseAssets[i % baseAssets.length]
      const name = `${base.name.split('-')[0]}-${String(Math.floor(i / baseAssets.length) * 10 + (i % baseAssets.length) + 1).padStart(2, '0')}`
      list.push({
        ...base,
        id: `cpt_asset_${i}`,
        name,
        health: parseFloat(Math.max(60, Math.min(100, base.health + (Math.sin(i) * 5))).toFixed(1)),
        status: i % 15 === 0 ? 'CRITICAL' : i % 8 === 0 ? 'ADVISORY' : i % 12 === 0 ? 'STANDBY' : 'OPTIMAL',
        activeAlerts: i % 15 === 0 ? '1 Critical' : i % 8 === 0 ? '1 Advisory' : '-'
      })
    }
    return list
  }
  if (facId === 'fac_pta_hq_01') {
    return baseAssets.slice(0, 28).map((a, i) => ({
      ...a,
      id: `pta_asset_${i}`
    }))
  }
  if (facId === 'fac_dbn_log_01') {
    return baseAssets.slice(0, 34).map((a, i) => ({
      ...a,
      id: `dbn_asset_${i}`
    }))
  }
  return baseAssets
}

// Local detailed seed mapping for facilities to support all locations dynamically
interface AssetData {
  name: string
  sub: string
  health: number
  status: 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL'
  load: string
}

interface EventData {
  title: string
  time: string
  status: 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL' | 'NEUTRAL'
}

interface FacilityDetailData {
  managerName: string
  totalArea: string
  commissioned: string
  tierRating: string
  gridZone: string
  healthScore: number
  healthTrend: string
  pueRatio?: number
  pueTrend?: string
  hvacEff?: string
  hvacTrend?: string
  comfortIdx?: string
  comfortTrend?: string
  peakLoad?: string
  peakLoadTrend?: string
  energyDraw: string
  energyPeak: string
  assets: AssetData[]
  events: EventData[]
}

const FACILITY_DETAILS_MAP: Record<string, FacilityDetailData> = {
  fac_jhb_dc_01: {
    managerName: 'David Mbeka',
    totalArea: '12,500 sqm',
    commissioned: 'Aug 2021',
    tierRating: 'Tier III',
    gridZone: 'City Power G-3',
    healthScore: 94,
    healthTrend: '+0.5%',
    pueRatio: 1.24,
    pueTrend: '-0.02',
    energyDraw: '1.8 MW',
    energyPeak: '2.1 MW',
    assets: [
      { name: 'CRAC-01', sub: 'Cooling Unit A', health: 98, status: 'OPTIMAL', load: '12.4 kW' },
      { name: 'CRAC-02', sub: 'Cooling Unit B', health: 94, status: 'OPTIMAL', load: '14.1 kW' },
      { name: 'CHL-01', sub: 'Main Chiller', health: 82, status: 'ADVISORY', load: '45.2 kW' },
      { name: 'UPS-A', sub: 'Primary Battery Bank', health: 99, status: 'OPTIMAL', load: '45% Load' },
    ],
    events: [
      { title: 'CHL-01 Vibration Anomaly', time: 'Today, 08:14 AM', status: 'ADVISORY' },
      { title: 'CRAC-02 Filter Replaced', time: 'Yesterday, 14:30 PM', status: 'OPTIMAL' },
      { title: 'Routine ESG Data Sync', time: 'Yesterday, 00:00 AM', status: 'WATCH' },
      { title: 'UPS-A Quarterly Test Passed', time: 'Mar 12, 11:00 AM', status: 'NEUTRAL' },
    ]
  },
  fac_cpt_mfg_01: {
    managerName: 'Lindiwe Dube',
    totalArea: '34,200 sqm',
    commissioned: 'Nov 2018',
    tierRating: 'N/A',
    gridZone: 'Eskom Western Cape',
    healthScore: 72,
    healthTrend: '-1.4%',
    pueRatio: 1.45,
    pueTrend: '+0.05',
    energyDraw: '4.2 MW',
    energyPeak: '4.8 MW',
    assets: [
      { name: 'ROB-01', sub: 'Assembly Robot A', health: 71, status: 'CRITICAL', load: '85 kW' },
      { name: 'CRAC-02', sub: 'Computer Room AC', health: 71, status: 'CRITICAL', load: '22.4 kW' },
      { name: 'UPS-B', sub: 'Uninterruptible Power', health: 78, status: 'ADVISORY', load: '18.1 kW' },
      { name: 'COMP-01', sub: 'Air Compressor', health: 89, status: 'OPTIMAL', load: '55 kW' },
    ],
    events: [
      { title: 'CRAC-02 Overheat Anomaly', time: 'Today, 10:12 AM', status: 'CRITICAL' },
      { title: 'Energy Waste Deviation +25%', time: 'Today, 09:47 AM', status: 'ADVISORY' },
      { title: 'ROB-01 Joint Maintenance Scheduled', time: 'Yesterday, 11:00 AM', status: 'WATCH' },
      { title: 'COMP-01 Valve Inspected', time: 'May 18, 08:30 AM', status: 'OPTIMAL' },
    ]
  },
  fac_pta_hq_01: {
    managerName: 'Sipho Mokoena',
    totalArea: '8,400 sqm',
    commissioned: 'Jan 2020',
    tierRating: 'Tier II',
    gridZone: 'Tshwane Grid G-1',
    healthScore: 88,
    healthTrend: '+0.2%',
    hvacEff: '86%',
    hvacTrend: '+1.5%',
    comfortIdx: '92%',
    comfortTrend: 'Stable',
    energyDraw: '640 kW',
    energyPeak: '720 kW',
    assets: [
      { name: 'AHU-03', sub: 'Air Handling Unit', health: 84, status: 'ADVISORY', load: '8.7 kW' },
      { name: 'CHL-02', sub: 'Rooftop Chiller', health: 91, status: 'OPTIMAL', load: '120 kW' },
      { name: 'ELEV-01', sub: 'Main Passenger Lift', health: 95, status: 'OPTIMAL', load: '15 kW' },
      { name: 'LGT-01', sub: 'Base Building Lighting', health: 100, status: 'OPTIMAL', load: '45 kW' },
    ],
    events: [
      { title: 'AHU-03 Vibration ISO Zone C', time: 'Today, 06:14 AM', status: 'ADVISORY' },
      { title: 'CHL-02 Refrigerant Level Check', time: 'Yesterday, 15:45 PM', status: 'OPTIMAL' },
      { title: 'Routine Building Comfort Assessment', time: 'May 20, 09:00 AM', status: 'NEUTRAL' },
      { title: 'Elevator-01 Annual Safety Audit', time: 'May 15, 14:00 PM', status: 'OPTIMAL' },
    ]
  },
  fac_dbn_log_01: {
    managerName: 'Zanele Mthembu',
    totalArea: '18,900 sqm',
    commissioned: 'May 2022',
    tierRating: 'N/A',
    gridZone: 'eThekwini Grid E-5',
    healthScore: 98,
    healthTrend: '+1.1%',
    peakLoad: '920 kW',
    peakLoadTrend: 'Optimal',
    energyDraw: '840 kW',
    energyPeak: '920 kW',
    assets: [
      { name: 'CONV-01', sub: 'Main Conveyor System', health: 97, status: 'OPTIMAL', load: '45 kW' },
      { name: 'CHL-03', sub: 'Cold Storage Unit A', health: 98, status: 'OPTIMAL', load: '180 kW' },
      { name: 'GEN-01', sub: 'Backup Diesel Generator', health: 100, status: 'OPTIMAL', load: 'Idle' },
      { name: 'LGT-02', sub: 'Warehouse LED Grid', health: 99, status: 'OPTIMAL', load: '32 kW' },
    ],
    events: [
      { title: 'DBN-LOG-01 Off-hours Load +8%', time: 'Today, 02:30 AM', status: 'WATCH' },
      { title: 'Backup Generator Load Test Success', time: 'Yesterday, 10:00 AM', status: 'OPTIMAL' },
      { title: 'Main Conveyor Belt Tension Alignment', time: 'May 19, 16:30 PM', status: 'OPTIMAL' },
      { title: 'Cold Storage Temperature Calibration', time: 'May 12, 11:30 AM', status: 'OPTIMAL' },
    ]
  }
}

interface FacilityDetailsViewProps {
  facilityId: string
}

export function FacilityDetailsView({ facilityId }: FacilityDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'energy' | 'alerts' | 'orders'>('overview')

  const [assetSearch, setAssetSearch] = useState('')
  const [assetCategory, setAssetCategory] = useState('All')
  const [assetStatus, setAssetStatus] = useState('All')
  const [assetHealth, setAssetHealth] = useState('Any')
  const [currentPage, setCurrentPage] = useState(1)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [healthOpen, setHealthOpen] = useState(false)

  const categoryRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const healthRef = useRef<HTMLDivElement>(null)

  // Work Orders state variables
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('All')
  const [orderPriority, setOrderPriority] = useState('All')
  const [orderAssignee, setOrderAssignee] = useState('All')
  const [orderPage, setOrderPage] = useState(1)

  const [orderStatusOpen, setOrderStatusOpen] = useState(false)
  const [orderPriorityOpen, setOrderPriorityOpen] = useState(false)
  const [orderAssigneeOpen, setOrderAssigneeOpen] = useState(false)

  const orderStatusRef = useRef<HTMLDivElement>(null)
  const orderPriorityRef = useRef<HTMLDivElement>(null)
  const orderAssigneeRef = useRef<HTMLDivElement>(null)

  // Alert Log state variables
  const [alertSearch, setAlertSearch] = useState('')
  const [alertSeverity, setAlertSeverity] = useState('All')
  const [alertStatus, setAlertStatus] = useState('Active & Ack')
  const [alertAsset, setAlertAsset] = useState('All')
  const [alertDateRange, setAlertDateRange] = useState('Last 7 Days')
  const [alertPage, setAlertPage] = useState(1)

  const [alertSeverityOpen, setAlertSeverityOpen] = useState(false)
  const [alertStatusOpen, setAlertStatusOpen] = useState(false)
  const [alertAssetOpen, setAlertAssetOpen] = useState(false)
  const [alertDateRangeOpen, setAlertDateRangeOpen] = useState(false)

  const alertSeverityRef = useRef<HTMLDivElement>(null)
  const alertStatusRef = useRef<HTMLDivElement>(null)
  const alertAssetRef = useRef<HTMLDivElement>(null)
  const alertDateRangeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryOpen(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setStatusOpen(false)
      }
      if (healthRef.current && !healthRef.current.contains(event.target as Node)) {
        setHealthOpen(false)
      }
      if (orderStatusRef.current && !orderStatusRef.current.contains(event.target as Node)) {
        setOrderStatusOpen(false)
      }
      if (orderPriorityRef.current && !orderPriorityRef.current.contains(event.target as Node)) {
        setOrderPriorityOpen(false)
      }
      if (orderAssigneeRef.current && !orderAssigneeRef.current.contains(event.target as Node)) {
        setOrderAssigneeOpen(false)
      }
      if (alertSeverityRef.current && !alertSeverityRef.current.contains(event.target as Node)) {
        setAlertSeverityOpen(false)
      }
      if (alertStatusRef.current && !alertStatusRef.current.contains(event.target as Node)) {
        setAlertStatusOpen(false)
      }
      if (alertAssetRef.current && !alertAssetRef.current.contains(event.target as Node)) {
        setAlertAssetOpen(false)
      }
      if (alertDateRangeRef.current && !alertDateRangeRef.current.contains(event.target as Node)) {
        setAlertDateRangeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const baseFacility = useMemo(() => {
    return DEMO_FACILITIES.find((f) => f.id === facilityId)
  }, [facilityId])

  const details = useMemo(() => {
    return FACILITY_DETAILS_MAP[facilityId] || FACILITY_DETAILS_MAP.fac_jhb_dc_01
  }, [facilityId])

  const allAssets = useMemo(() => {
    return getAssetsForFacility(facilityId)
  }, [facilityId])

  const filteredAssets = useMemo(() => {
    return allAssets.filter((asset) => {
      const searchStr = assetSearch.toLowerCase()
      const matchesSearch =
        !assetSearch ||
        asset.name.toLowerCase().includes(searchStr) ||
        asset.id.toLowerCase().includes(searchStr) ||
        (asset.sub && asset.sub.toLowerCase().includes(searchStr))

      const matchesCategory =
        assetCategory === 'All' || asset.category === assetCategory

      const matchesStatus =
        assetStatus === 'All' ||
        asset.status.toUpperCase() === assetStatus.toUpperCase()

      let matchesHealthStatus = true
      if (assetHealth === 'Optimal (>=90%)') {
        matchesHealthStatus = asset.health >= 90
      } else if (assetHealth === 'Sub-optimal (<90%)') {
        matchesHealthStatus = asset.health < 90
      } else if (assetHealth === 'Critical (<70%)') {
        matchesHealthStatus = asset.health < 70
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesHealthStatus
    })
  }, [allAssets, assetSearch, assetCategory, assetStatus, assetHealth])

  const totalPages = Math.ceil(filteredAssets.length / 10) || 1
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * 10
    return filteredAssets.slice(startIndex, startIndex + 10)
  }, [filteredAssets, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const filteredOrders = useMemo(() => {
    return DEMO_WORK_ORDERS.filter((order) => {
      const searchStr = orderSearch.toLowerCase()
      const matchesSearch =
        !orderSearch ||
        order.id.toLowerCase().includes(searchStr) ||
        order.assetCode.toLowerCase().includes(searchStr) ||
        order.description.toLowerCase().includes(searchStr) ||
        order.assigneeName.toLowerCase().includes(searchStr)

      const matchesStatus =
        orderStatus === 'All' || order.status === orderStatus

      const matchesPriority =
        orderPriority === 'All' || order.priority === orderPriority

      const matchesAssignee =
        orderAssignee === 'All' ||
        (orderAssignee === 'Unassigned' && order.assigneeName === 'Unassigned') ||
        (orderAssignee !== 'Unassigned' && order.assigneeName === orderAssignee)

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
    })
  }, [orderSearch, orderStatus, orderPriority, orderAssignee])

  const totalOrderPages = Math.ceil(filteredOrders.length / 5) || 1
  const paginatedOrders = useMemo(() => {
    const startIndex = (orderPage - 1) * 5
    return filteredOrders.slice(startIndex, startIndex + 5)
  }, [filteredOrders, orderPage])

  useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages)
    }
  }, [totalOrderPages, orderPage])

  // Dynamic alert asset list extraction and sorting
  const alertAssetOptions = useMemo(() => {
    const assets = new Set<string>()
    DEMO_ALERTS.forEach((a) => {
      assets.add(a.assetCode)
    })
    return ['All', ...Array.from(assets).sort()]
  }, [])

  // Client-side filtering logic for the Alert Log
  const filteredAlerts = useMemo(() => {
    return DEMO_ALERTS.filter((alert) => {
      const searchLower = alertSearch.toLowerCase()
      const matchesSearch =
        !alertSearch ||
        alert.id.toLowerCase().includes(searchLower) ||
        alert.assetCode.toLowerCase().includes(searchLower) ||
        alert.assetName.toLowerCase().includes(searchLower) ||
        alert.description.toLowerCase().includes(searchLower) ||
        (alert.subDescription && alert.subDescription.toLowerCase().includes(searchLower))

      const matchesSeverity =
        alertSeverity === 'All' ||
        alert.severity.toUpperCase() === alertSeverity.toUpperCase()

      const matchesStatus =
        alertStatus === 'All' ||
        (alertStatus === 'Active & Ack' && (alert.status === 'Active' || alert.status === 'Acknowledged' || alert.showInActiveLog)) ||
        (alertStatus === 'Active' && alert.status === 'Active') ||
        (alertStatus === 'Acknowledged' && alert.status === 'Acknowledged') ||
        (alertStatus === 'Resolved' && alert.status === 'Resolved')

      const matchesAsset =
        alertAsset === 'All' || alert.assetCode === alertAsset

      return matchesSearch && matchesSeverity && matchesStatus && matchesAsset
    })
  }, [alertSearch, alertSeverity, alertStatus, alertAsset])

  const totalAlertPages = Math.ceil(filteredAlerts.length / 6) || 1

  const paginatedAlerts = useMemo(() => {
    const startIndex = (alertPage - 1) * 6
    return filteredAlerts.slice(startIndex, startIndex + 6)
  }, [filteredAlerts, alertPage])

  useEffect(() => {
    if (alertPage > totalAlertPages) {
      setAlertPage(totalAlertPages)
    }
  }, [totalAlertPages, alertPage])

  if (!baseFacility) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <Layers className="w-16 h-16 text-muted-foreground mb-4 opacity-40" />
        <h3 className="font-mono text-lg font-semibold tracking-wide text-[--text-primary] mb-2">
          Facility Not Found
        </h3>
        <p className="text-sm font-mono text-[--text-secondary] max-w-sm mb-6">
          The requested facility ID "{facilityId}" could not be located in the demo database.
        </p>
        <Link
          href="/facilities"
          className="flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
        >
          Back to Facilities List
        </Link>
      </div>
    )
  }

  // Type labels helper
  const typeLabelMap: Record<string, string> = {
    DATA_CENTER: 'Data Center',
    MANUFACTURING: 'Manufacturing',
    COMMERCIAL: 'Commercial',
    LOGISTICS: 'Logistics',
  }

  const getSubheaderLocation = (facId: string) => {
    if (facId === 'fac_jhb_dc_01') return 'Gauteng, RSA'
    if (facId === 'fac_cpt_mfg_01') return 'Western Cape, RSA'
    if (facId === 'fac_pta_hq_01') return 'Gauteng, RSA'
    return 'KwaZulu-Natal, RSA'
  }

  const statusLabelMap = {
    CRITICAL: { text: 'Action Req.', style: 'bg-red-500/10 border-red-500/20 text-red-400' },
    ADVISORY: { text: 'Sub-optimal', style: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    WATCH: { text: 'Watch', style: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
    OPTIMAL: { text: 'Optimal', style: 'bg-green-500/10 border-green-500/20 text-green-400' }
  }

  const statusProps = statusLabelMap[baseFacility.status]

  // Recharts 7-Day performance trend datasets configured dynamically by facility type
  const trendChartData = useMemo(() => {
    // Generate trend curves around resolved constants
    if (baseFacility.type === 'COMMERCIAL') {
      return [
        { day: 'Mon', health: 86, metric: 82 },
        { day: 'Tue', health: 87, metric: 83 },
        { day: 'Wed', health: 85, metric: 82 },
        { day: 'Thu', health: 88, metric: 85 },
        { day: 'Fri', health: 87, metric: 86 },
        { day: 'Sat', health: 89, metric: 86 },
        { day: 'Sun', health: 88, metric: 86 }
      ]
    }
    if (baseFacility.type === 'LOGISTICS') {
      return [
        { day: 'Mon', health: 96, metric: 780 },
        { day: 'Tue', health: 97, metric: 820 },
        { day: 'Wed', health: 98, metric: 850 },
        { day: 'Thu', health: 96, metric: 810 },
        { day: 'Fri', health: 97, metric: 890 },
        { day: 'Sat', health: 98, metric: 910 },
        { day: 'Sun', health: 98, metric: 920 }
      ]
    }
    // Default Data Center & Manufacturing PUE
    return [
      { day: 'Mon', health: 91, metric: 1.25 },
      { day: 'Tue', health: 90, metric: 1.29 },
      { day: 'Wed', health: 92, metric: 1.27 },
      { day: 'Thu', health: 88, metric: 1.25 },
      { day: 'Fri', health: 94, metric: 1.30 },
      { day: 'Sat', health: 95, metric: 1.28 },
      { day: 'Sun', health: 96, metric: 1.32 }
    ]
  }, [baseFacility.type])

  // Custom tooltips styling for trend chart
  const renderChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const pt = payload[0].payload
    const metricLabel =
      baseFacility.type === 'COMMERCIAL'
        ? 'HVAC Eff'
        : baseFacility.type === 'LOGISTICS'
        ? 'Energy Load'
        : 'PUE Ratio'
    
    const metricVal =
      baseFacility.type === 'COMMERCIAL'
        ? `${pt.metric}%`
        : baseFacility.type === 'LOGISTICS'
        ? `${pt.metric} kW`
        : pt.metric.toFixed(2)

    return (
      <div
        className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-strong)',
        }}
      >
        <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider text-[--text-secondary]">
          {pt.day} Performance
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-5">
            <span className="text-[--text-secondary]">Health Score:</span>
            <span className="font-bold text-[--status-optimal]">{pt.health}%</span>
          </div>
          <div className="flex justify-between items-center gap-5">
            <span className="text-[--text-secondary]">{metricLabel}:</span>
            <span className="font-bold text-[--status-advisory]">{metricVal}</span>
          </div>
        </div>
      </div>
    )
  }

  // Type-specific chart variables
  const rightMetricKey = 'metric'
  const rightMetricLegend =
    baseFacility.type === 'COMMERCIAL'
      ? 'HVAC Efficiency'
      : baseFacility.type === 'LOGISTICS'
      ? 'Energy Load'
      : 'PUE'

  const rightYDomain =
    baseFacility.type === 'COMMERCIAL'
      ? [50, 100]
      : baseFacility.type === 'LOGISTICS'
      ? [0, 1000]
      : [1.2, 1.8]

  const rightYTicks =
    baseFacility.type === 'COMMERCIAL'
      ? [50, 75, 100]
      : baseFacility.type === 'LOGISTICS'
      ? [0, 500, 1000]
      : [1.2, 1.5, 1.8]

  const rightYFormatter = (val: number) => {
    if (baseFacility.type === 'COMMERCIAL') return `${val}%`
    if (baseFacility.type === 'LOGISTICS') return `${val}kW`
    return val.toFixed(1)
  }

  // Event list style mapping helper
  const getEventStyle = (status: 'OPTIMAL' | 'WATCH' | 'ADVISORY' | 'CRITICAL' | 'NEUTRAL') => {
    switch (status) {
      case 'CRITICAL':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[--status-critical]" />,
          iconBg: 'bg-[--status-critical]/10'
        }
      case 'ADVISORY':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-[--status-advisory]" />,
          iconBg: 'bg-[--status-advisory]/10'
        }
      case 'WATCH':
        return {
          icon: <Info className="w-4 h-4 text-[--status-watch]" />,
          iconBg: 'bg-[--status-watch]/10'
        }
      case 'OPTIMAL':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[--status-optimal]" />,
          iconBg: 'bg-[--status-optimal]/10'
        }
      case 'NEUTRAL':
      default:
        return {
          icon: <Activity className="w-4 h-4 text-[--text-muted]" />,
          iconBg: 'bg-[--bg-elevated]'
        }
    }
  }

  // Status text for Table items
  const getAssetStatusProps = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-red-500/10 border-red-500/20 text-red-400'
      case 'ADVISORY':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'WATCH':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-blue-500/10 border-blue-500/20 text-blue-400'
      case 'OPTIMAL':
      default:
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-green-500/10 border-green-500/20 text-green-400'
    }
  }

  // Priority badge styling helper for Work Orders
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-red-500/10 border-red-500/30 text-red-400'
      case 'High':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'Medium':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-zinc-500/15 border-zinc-500/30 text-zinc-300'
      case 'Low':
      default:
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-zinc-500/5 border-zinc-500/15 text-zinc-400'
    }
  }

  // Status badge styling helper for Work Orders
  const getOrderStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-teal-500/10 border-teal-500/20 text-teal-400'
      case 'Completed':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-green-500/10 border-green-500/20 text-green-400 border-green-500/25'
      case 'Pending Parts':
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'Open':
      default:
        return 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-zinc-500/10 border-zinc-500/30 text-zinc-300'
    }
  }

  // Assignee Avatar avatar renderer helper
  const getAssigneeAvatar = (name: string) => {
    if (name === 'Unassigned') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-dashed border-[--border-strong] flex items-center justify-center text-[--text-muted]">
            <User className="w-3 h-3" />
          </div>
          <span className="text-xs text-[--text-secondary]">Unassigned</span>
        </div>
      )
    }
    const initials = name
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .toUpperCase()

    // Premium color combinations based on name hashing
    const colors = [
      'bg-blue-600/20 text-blue-300 border-blue-500/20',
      'bg-emerald-600/20 text-emerald-300 border-emerald-500/20',
      'bg-purple-600/20 text-purple-300 border-purple-500/20',
      'bg-pink-600/20 text-pink-300 border-pink-500/20',
      'bg-amber-600/20 text-amber-300 border-amber-500/20'
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colorClass = colors[hash % colors.length]

    return (
      <div className="flex items-center gap-2">
        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold", colorClass)}>
          {initials || 'U'}
        </div>
        <span className="text-xs text-[--text-primary] font-mono">{name}</span>
      </div>
    )
  }

  // Alert Log helper functions
  const getSeverityBadgeClass = (severity: 'CRITICAL' | 'WARNING' | 'INFO') => {
    switch (severity) {
      case 'CRITICAL':
        return 'border border-red-500/30 bg-red-500/10 text-red-400 font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded tracking-wide'
      case 'WARNING':
        return 'border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded tracking-wide'
      case 'INFO':
      default:
        return 'border border-[--border-default] bg-[--bg-surface] text-[--text-secondary] font-bold font-mono text-[9px] uppercase px-2 py-0.5 rounded tracking-wide'
    }
  }

  const getAlertStatusDot = (status: 'Active' | 'Acknowledged' | 'Resolved') => {
    switch (status) {
      case 'Active':
        return <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 inline-block" />
      case 'Acknowledged':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 inline-block" />
      case 'Resolved':
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0 inline-block" />
    }
  }

  const getMetricClass = (severity: string, status: string) => {
    if (severity === 'CRITICAL') {
      return 'text-[--status-critical]'
    }
    if (severity === 'WARNING' && status === 'Active') {
      return 'text-[--status-advisory]'
    }
    return 'text-[--text-secondary]'
  }

  // Mock Sparkline curves for KPI Cards
  const kpiHealthSparkline = [93.1, 93.3, 93.6, 93.5, 93.8, 93.9, 94.0]
  const kpiMetricSparkline =
    baseFacility.type === 'COMMERCIAL'
      ? [84.1, 84.8, 85.0, 85.3, 85.8, 86.0, 86.0]
      : baseFacility.type === 'LOGISTICS'
      ? [860, 880, 910, 890, 910, 920, 920]
      : [1.28, 1.27, 1.26, 1.26, 1.25, 1.25, 1.24]
  
  const kpiLoadSparkline = [1.70, 1.72, 1.76, 1.74, 1.77, 1.79, 1.80]

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb row */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
        <Link href="/facilities" className="hover:text-[--text-primary] transition-colors">
          Facilities
        </Link>
        <ChevronRight className="w-3 h-3 text-[--text-muted]" />
        {activeTab === 'overview' ? (
          <span style={{ color: 'var(--text-muted)' }}>{baseFacility.name}</span>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-[--text-primary] transition-colors bg-transparent border-0 p-0 font-mono text-[10px] cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              {baseFacility.name}
            </button>
            <ChevronRight className="w-3 h-3 text-[--text-muted]" />
            <span style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'energy'
                ? 'Energy & PUE'
                : activeTab === 'assets'
                ? 'Assets'
                : activeTab === 'alerts'
                ? 'Alert Log'
                : 'Work Orders'}
            </span>
          </>
        )}
      </div>

      {/* Header Info Title Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary]">
              {baseFacility.name}
            </h1>
            <span className={cn('px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider', statusProps.style)}>
              {statusProps.text}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span>{getSubheaderLocation(baseFacility.id)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span>{typeLabelMap[baseFacility.type] || 'Commercial'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span>ID: {baseFacility.externalId}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>Export Report</span>
          </button>

          <Link
            href={`/facilities/${facilityId}/settings`}
            className="flex items-center gap-1.5 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Manage Facility</span>
          </Link>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            activeTab === 'overview'
              ? 'border-[--accent-primary] text-[--text-primary]'
              : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={cn(
            'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            activeTab === 'assets'
              ? 'border-[--accent-primary] text-[--text-primary]'
              : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
          )}
        >
          Assets ({allAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('energy')}
          className={cn(
            'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            activeTab === 'energy'
              ? 'border-[--accent-primary] text-[--text-primary]'
              : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
          )}
        >
          Energy & PUE
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={cn(
            'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            activeTab === 'alerts'
              ? 'border-[--accent-primary] text-[--text-primary]'
              : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
          )}
        >
          Alert Log
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            'px-4 py-2 text-xs font-mono font-medium border-b-2 -mb-px transition-colors cursor-pointer',
            activeTab === 'orders'
              ? 'border-[--accent-primary] text-[--text-primary]'
              : 'border-transparent text-[--text-secondary] hover:text-[--text-primary]'
          )}
        >
          Work Orders
        </button>
      </div>

      {/* Tabs View Content Router */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Column (KPIs, Chart, Asset Table) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Overall Health Card */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Overall Health
                    </span>
                    <Activity className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>{details.healthScore}%</span>
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-optimal]">
                      <TrendingUp className="w-2.5 h-2.5" />
                      <span>{details.healthTrend}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    Target: &gt;90%
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpiHealthSparkline.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--status-optimal)" strokeWidth={1} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Type-Specific Metric Card (PUE, HVAC Eff, Peak Load) */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      {baseFacility.type === 'COMMERCIAL'
                        ? 'HVAC Efficiency'
                        : baseFacility.type === 'LOGISTICS'
                        ? 'Peak Load'
                        : 'PUE Ratio'}
                    </span>
                    <Zap className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1.5 text-[--text-primary]">
                    <span>
                      {baseFacility.type === 'COMMERCIAL'
                        ? details.hvacEff
                        : baseFacility.type === 'LOGISTICS'
                        ? details.peakLoad
                        : details.pueRatio?.toFixed(2)}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-0.5 text-[9px] font-bold',
                        baseFacility.status === 'CRITICAL' ? 'text-[--status-critical]' : 'text-[--status-optimal]'
                      )}
                    >
                      {baseFacility.type === 'LOGISTICS' ? (
                        <span className="text-[8px]">Stable</span>
                      ) : (
                        <>
                          <TrendingDown className="w-2.5 h-2.5" />
                          <span>{baseFacility.type === 'COMMERCIAL' ? details.hvacTrend : details.pueTrend}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    {baseFacility.type === 'COMMERCIAL'
                      ? 'Target: >85%'
                      : baseFacility.type === 'LOGISTICS'
                      ? 'Contract Limit: 1000 kW'
                      : 'Industry Avg: 1.50'}
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpiMetricSparkline.map((v) => ({ v }))}>
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke={baseFacility.status === 'CRITICAL' ? 'var(--status-critical)' : 'var(--status-optimal)'}
                          strokeWidth={1}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Energy Draw Card */}
              <div
                className="rounded-[10px] border p-5 flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                      Energy Draw
                    </span>
                    <Zap className="w-4 h-4 text-[--text-muted]" />
                  </div>
                  <div className="font-mono text-2xl font-light mb-1 flex items-baseline gap-1 text-[--text-primary]">
                    <span>{details.energyDraw}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-3">
                  <span className="text-[10px] font-mono text-[--text-secondary]">
                    Peak Load: {details.energyPeak}
                  </span>
                  <div className="w-[60px] h-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpiLoadSparkline.map((v) => ({ v }))}>
                        <Line type="monotone" dataKey="v" stroke="var(--text-secondary)" strokeWidth={1} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trend Chart Widget */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-mono text-sm font-medium uppercase tracking-wider text-[--text-primary]">
                    7-Day Performance Trend
                  </h3>
                </div>

                {/* Custom Legends */}
                <div className="flex items-center gap-4 text-[10px] font-mono tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-[--accent-primary]" />
                    <span>Health Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-[--status-advisory]" />
                    <span>{rightMetricLegend}</span>
                  </div>
                </div>
              </div>

              {/* Chart Body */}
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendChartData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                    />
                    
                    {/* Left Health Score YAxis */}
                    <YAxis
                      yAxisId="left"
                      domain={[50, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                    />
                    
                    {/* Right Dynamic Metric YAxis */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={rightYDomain}
                      ticks={rightYTicks}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={rightYFormatter}
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                    />

                    <Tooltip content={renderChartTooltip} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />

                    {/* Health Score line */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="health"
                      stroke="var(--accent-primary)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                    />

                    {/* Secondary Type-specific line */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={rightMetricKey}
                      stroke="var(--status-advisory)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Critical Monitored Assets Table */}
            <div
              className="rounded-[10px] border flex flex-col overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-mono text-sm font-medium uppercase tracking-wider text-[--text-primary]">
                  Critical Monitored Assets
                </h3>
                <button
                  onClick={() => setActiveTab('assets')}
                  className="font-mono text-xs text-[--accent-primary] hover:underline cursor-pointer"
                >
                  View All ({details.assets.length}) →
                </button>
              </div>

              {/* Table Element */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th className="p-4 pl-5 font-semibold">Asset</th>
                      <th className="p-4 font-semibold text-center">Health</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Load / Draw</th>
                      <th className="p-4 pr-5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                    {details.assets.map((asset, idx) => (
                      <tr key={idx} className="hover:bg-[--bg-hover]/40 transition-colors">
                        <td className="p-4 pl-5">
                          <div className="font-semibold text-[--text-primary]">{asset.name}</div>
                          <div className="text-[10px] text-[--text-secondary] mt-0.5">{asset.sub}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={cn('font-bold', getHealthColor(asset.health))}>
                            {asset.health}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={getAssetStatusProps(asset.status)}>
                            {asset.status === 'ADVISORY' ? 'Advisory' : asset.status === 'CRITICAL' ? 'Critical' : 'Optimal'}
                          </span>
                        </td>
                        <td className="p-4 text-[--text-primary]">{asset.load}</td>
                        <td className="p-4 pr-5 text-right">
                          <Link
                            href={`/equipment/asset_chl_01`} // Mocked redirection link pointing to main details
                            className="inline-flex items-center justify-center px-3 py-1 rounded border text-[11px] font-medium transition-colors hover:border-[--border-strong]"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              borderColor: 'var(--border-default)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Facility Info, Recent Events) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Facility Information Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary] mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                Facility Information
              </h3>
              
              <div className="space-y-4 font-mono text-xs">
                {/* Manager */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[--text-secondary] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Manager</span>
                  </span>
                  <span className="text-[--text-primary] font-semibold text-right">{details.managerName}</span>
                </div>

                {/* Total Area */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[--text-secondary] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Total Area</span>
                  </span>
                  <span className="text-[--text-primary] font-semibold text-right">{details.totalArea}</span>
                </div>

                {/* Commissioned */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[--text-secondary] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Commissioned</span>
                  </span>
                  <span className="text-[--text-primary] font-semibold text-right">{details.commissioned}</span>
                </div>

                {/* Tier Rating */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[--text-secondary] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Tier Rating</span>
                  </span>
                  <span className="text-[--text-primary] font-semibold text-right">{details.tierRating}</span>
                </div>

                {/* Grid Zone */}
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[--text-secondary] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[--text-muted]" />
                    <span>Grid Zone</span>
                  </span>
                  <span className="text-[--text-primary] font-semibold text-right">{details.gridZone}</span>
                </div>
              </div>
            </div>

            {/* Recent Events Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Recent Events
                </h3>
                <button className="text-[--text-muted] hover:text-[--text-primary] cursor-pointer" aria-label="More Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Event List */}
              <div className="space-y-4 mb-4">
                {details.events.map((evt, idx) => {
                  const evStyle = getEventStyle(evt.status)
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={cn('w-7 h-7 rounded flex items-center justify-center shrink-0', evStyle.iconBg)}>
                        {evStyle.icon}
                      </div>
                      <div className="font-mono text-xs">
                        <div className="font-semibold text-[--text-primary] leading-normal">{evt.title}</div>
                        <div className="text-[10px] text-[--text-secondary] mt-0.5">{evt.time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer View Full Log Button */}
              <button
                onClick={() => setActiveTab('alerts')}
                className="w-full py-2 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer text-center"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                View Full Log
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'assets' ? (
        <div className="flex flex-col gap-5">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full pb-1">
            {/* Search box */}
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[--text-muted]" />
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={assetSearch}
                onChange={(e) => {
                  setAssetSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full bg-[--bg-surface] border border-[--border-default] rounded-[6px] pl-9 pr-3 py-1.5 text-xs font-mono text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--border-strong] transition-all"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative font-mono" ref={categoryRef}>
              <button
                onClick={() => {
                  setCategoryOpen(!categoryOpen)
                  setStatusOpen(false)
                  setHealthOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Category:</span>
                <span>{assetCategory}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {categoryOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'HVAC', 'Cooling', 'Power', 'Airflow'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAssetCategory(opt)
                        setCategoryOpen(false)
                        setCurrentPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer"
                    >
                      <span>{opt}</span>
                      {assetCategory === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative font-mono" ref={statusRef}>
              <button
                onClick={() => {
                  setStatusOpen(!statusOpen)
                  setCategoryOpen(false)
                  setHealthOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Status:</span>
                <span>{assetStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {statusOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'Optimal', 'Advisory', 'Standby', 'Critical'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAssetStatus(opt)
                        setStatusOpen(false)
                        setCurrentPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer"
                    >
                      <span>{opt}</span>
                      {assetStatus === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Health Filter Dropdown */}
            <div className="relative font-mono" ref={healthRef}>
              <button
                onClick={() => {
                  setHealthOpen(!healthOpen)
                  setCategoryOpen(false)
                  setStatusOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Health:</span>
                <span>{assetHealth}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {healthOpen && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['Any', 'Optimal (>=90%)', 'Sub-optimal (<90%)', 'Critical (<70%)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAssetHealth(opt)
                        setHealthOpen(false)
                        setCurrentPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer"
                    >
                      <span>{opt}</span>
                      {assetHealth === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Asset Button */}
            <button
              className="flex items-center gap-1.5 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Add Asset</span>
            </button>
          </div>

          {/* Table Container */}
          <div
            className="rounded-[10px] border flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th className="p-4 pl-5 font-semibold text-left">Asset ID & Name</th>
                    <th className="p-4 font-semibold text-left">Category</th>
                    <th className="p-4 font-semibold text-left">Status</th>
                    <th className="p-4 font-semibold text-left">Health</th>
                    <th className="p-4 font-semibold text-left">Power / Load</th>
                    <th className="p-4 font-semibold text-left">Last Sync</th>
                    <th className="p-4 font-semibold text-left">Active Alerts</th>
                    <th className="p-4 pr-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-[--text-muted]">
                        No assets found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((asset) => {
                      const healthColor = getHealthColor(asset.health)
                      
                      // Category Icon
                      let categoryIcon = <Cpu className="w-3.5 h-3.5 text-[--text-secondary]" />
                      if (asset.category === 'Cooling') {
                        categoryIcon = <Snowflake className="w-3.5 h-3.5 text-[--text-secondary]" />
                      } else if (asset.category === 'Power') {
                        categoryIcon = <Zap className="w-3.5 h-3.5 text-[--text-secondary]" />
                      } else if (asset.category === 'Airflow') {
                        categoryIcon = <Wind className="w-3.5 h-3.5 text-[--text-secondary]" />
                      }

                      // Status Badge classes
                      let statusBadgeClass = 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase '
                      let statusText = 'Optimal'
                      switch (asset.status) {
                        case 'CRITICAL':
                          statusBadgeClass += 'bg-red-500/10 border-red-500/20 text-red-400'
                          statusText = 'Critical'
                          break
                        case 'ADVISORY':
                          statusBadgeClass += 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          statusText = 'Advisory'
                          break
                        case 'STANDBY':
                          statusBadgeClass += 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          statusText = 'Standby'
                          break
                        case 'WATCH':
                          statusBadgeClass += 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          statusText = 'Watch'
                          break
                        case 'OPTIMAL':
                        default:
                          statusBadgeClass += 'bg-green-500/10 border-green-500/20 text-green-400'
                          statusText = 'Optimal'
                          break
                      }

                      // Alerts Badge classes
                      const hasAlert = asset.activeAlerts !== '-'
                      const isAlertCritical = asset.activeAlerts.toLowerCase().includes('critical')
                      const alertsBadgeClass = hasAlert
                        ? isAlertCritical
                          ? 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-red-500/10 border-red-500/20 text-red-400 inline-block align-middle'
                          : 'px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/20 text-amber-400 inline-block align-middle'
                        : 'text-[--text-muted]'

                      return (
                        <tr key={asset.id} className="hover:bg-[--bg-hover]/40 transition-colors">
                          <td className="p-4 pl-5">
                            <div className="font-semibold text-[--text-primary] text-xs">{asset.name}</div>
                            <div className="text-[10px] text-[--text-secondary] mt-0.5">{asset.sub}</div>
                          </td>
                          <td className="p-4 text-[--text-primary]">
                            <div className="flex items-center gap-1.5">
                              {categoryIcon}
                              <span className="text-xs text-[--text-secondary] font-medium">{asset.category}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={statusBadgeClass}>
                              {statusText}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={cn('font-bold font-mono text-xs', healthColor)}>
                              {asset.health.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-[--text-primary] font-mono text-xs">{asset.load}</td>
                          <td className="p-4 text-[--text-primary] font-mono text-xs">{asset.lastSync}</td>
                          <td className="p-4">
                            {hasAlert ? (
                              <span className={alertsBadgeClass}>
                                {asset.activeAlerts}
                              </span>
                            ) : (
                              <span className="text-[--text-muted] font-mono text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4 pr-5 text-right">
                            <Link
                              href={`/equipment/${asset.id}`}
                              className="inline-flex items-center justify-center px-3 py-1 rounded border text-[11px] font-mono font-medium transition-colors hover:border-[--border-strong]"
                              style={{
                                backgroundColor: 'var(--bg-elevated)',
                                borderColor: 'var(--border-default)',
                                color: 'var(--text-primary)',
                              }}
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-mono text-[--text-secondary]">
                Showing {filteredAssets.length === 0 ? 0 : (currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredAssets.length)} of {filteredAssets.length} assets
              </span>

              {/* Page numbers */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isCurrent = currentPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          'flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold transition-all cursor-pointer border',
                          isCurrent
                            ? 'bg-[--accent-primary] text-[#0A0D14] border-[--accent-primary]'
                            : 'bg-transparent border-[--border-default] text-[--text-secondary] hover:border-[--border-strong] hover:text-[--text-primary]'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'energy' ? (
        <div className="flex flex-col gap-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Power Draw Card */}
            <div
              className="relative rounded-[10px] border p-5 flex flex-col justify-between overflow-hidden h-[135px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Active Power Draw
                  </span>
                  <Zap className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light text-[--text-primary]">
                  1.84 <span className="text-sm font-normal text-[--text-secondary]">MW</span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 z-10">
                <span className="text-[10px] font-mono text-[--text-secondary]">
                  Peak: 2.12 MW
                </span>
              </div>
              {/* Sparkline overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[1.72, 1.76, 1.84, 1.80, 1.95, 1.88, 1.84].map(v => ({ v }))} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PUE Ratio Card */}
            <div
              className="relative rounded-[10px] border p-5 flex flex-col justify-between overflow-hidden h-[135px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    PUE Ratio
                  </span>
                  <Gauge className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light text-[--text-primary] flex items-baseline gap-1.5">
                  <span>1.24</span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-optimal]">
                    <TrendingDown className="w-2.5 h-2.5" />
                    <span>-0.02</span>
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 z-10">
                <span className="text-[10px] font-mono text-[--text-secondary]">
                  Industry Avg: 1.58
                </span>
              </div>
              {/* Sparkline overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[1.28, 1.27, 1.26, 1.26, 1.25, 1.25, 1.24].map(v => ({ v }))} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Energy (MTD) Card */}
            <div
              className="relative rounded-[10px] border p-5 flex flex-col justify-between overflow-hidden h-[135px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Total Energy (MTD)
                  </span>
                  <Database className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light text-[--text-primary]">
                  1,324 <span className="text-sm font-normal text-[--text-secondary]">MWh</span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 z-10">
                <span className="text-[10px] font-mono text-[--text-secondary]">
                  Est. EOM: 1,850 MWh
                </span>
              </div>
              {/* Sparkline overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[1150, 1180, 1220, 1250, 1280, 1310, 1324].map(v => ({ v }))} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Carbon Intensity Card */}
            <div
              className="relative rounded-[10px] border p-5 flex flex-col justify-between overflow-hidden h-[135px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                    Carbon Intensity
                  </span>
                  <Leaf className="w-4 h-4 text-[--text-muted]" />
                </div>
                <div className="font-mono text-2xl font-light text-[--text-primary] flex items-baseline gap-1.5">
                  <span>0.42</span>
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-[--status-optimal]">
                    <TrendingDown className="w-2.5 h-2.5" />
                    <span>-5.2%</span>
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 z-10">
                <span className="text-[10px] font-mono text-[--text-secondary]">
                  kgCO₂/kWh
                </span>
              </div>
              {/* Sparkline overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[0.45, 0.44, 0.44, 0.43, 0.42, 0.42, 0.42].map(v => ({ v }))} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="v" stroke="var(--accent-primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Power Draw vs. PUE Trend Chart Card */}
          <div
            className="relative rounded-[10px] border p-5 flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-mono text-sm font-medium uppercase tracking-wider text-[--text-primary]">
                  Power Draw vs. PUE Trend
                </h3>
              </div>

              {/* Custom Legends */}
              <div className="flex items-center gap-4 text-[10px] font-mono tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[--accent-primary]" />
                  <span>Power Draw (MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0 border-t border-dashed border-[var(--text-muted)]" />
                  <span>Baseline (1.7 MW)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>PUE</span>
                </div>
              </div>
            </div>

            {/* Chart Body Container (needs relative to overlay annotation) */}
            <div className="h-[280px] w-full relative">
              
              {/* Annotation Box Overlay */}
              <div className="absolute top-[35%] left-[54%] z-20 pointer-events-none font-mono">
                <div className="relative">
                  {/* Annotation Box */}
                  <div className="bg-[#0b0e14] border border-amber-500/20 rounded px-3 py-2 shadow-2xl w-40">
                    <div className="text-[10px] font-bold text-amber-500">Cooling Spike</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">+15% draw vs baseline</div>
                  </div>
                  {/* Dashed line pointing from the bottom-right of the box to Friday's dot */}
                  <svg className="absolute top-[35px] left-[140px] w-24 h-12 overflow-visible">
                    <line x1="0" y1="0" x2="35" y2="25" stroke="#F5A623" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { day: 'Mon', power: 1.84, pue: 1.24 },
                    { day: 'Tue', power: 1.89, pue: 1.25 },
                    { day: 'Wed', power: 1.82, pue: 1.23 },
                    { day: 'Thu', power: 1.81, pue: 1.24 },
                    { day: 'Fri', power: 1.96, pue: 1.32 },
                    { day: 'Sat', power: 1.88, pue: 1.26 },
                    { day: 'Sun', power: 1.85, pue: 1.24 },
                  ]}
                  margin={{ top: 10, right: -5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                  />
                  
                  {/* Left Power Draw YAxis */}
                  <YAxis
                    yAxisId="left"
                    domain={[0.8, 2.5]}
                    ticks={[0.8, 1.6, 2.5]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.toFixed(1)}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                  />
                  
                  {/* Right PUE YAxis */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[1.15, 1.50]}
                    ticks={[1.15, 1.33, 1.50]}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.toFixed(2)}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const pt = payload[0].payload
                      return (
                        <div
                          className="p-3 rounded-[10px] border shadow-xl font-mono text-[11px]"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          <div className="text-[10px] mb-1.5 font-bold uppercase tracking-wider text-[--text-secondary]">
                            {pt.day} Metrics
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-5">
                              <span className="text-[--text-secondary]">Power Draw:</span>
                              <span className="font-bold text-[--accent-primary]">{pt.power} MW</span>
                            </div>
                            <div className="flex justify-between items-center gap-5">
                              <span className="text-[--text-secondary]">PUE Ratio:</span>
                              <span className="font-bold text-amber-500">{pt.pue.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                    cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                  />

                  {/* Baseline Reference Line */}
                  <ReferenceLine
                    yAxisId="left"
                    y={1.7}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />

                  {/* Power Draw Line */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="power"
                    stroke="var(--accent-primary)"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                  />

                  {/* PUE Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pue"
                    stroke="#F5A623"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, stroke: 'var(--bg-card)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Grid: Load Distribution & Top Power Consumers */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Load Distribution Widget */}
            <div
              className="rounded-[10px] border p-5 flex flex-col lg:col-span-2"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary] mb-4 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                Load Distribution
              </h3>

              <div className="flex flex-col gap-5 h-full justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-2xl font-light font-mono text-[--accent-primary]">1.84 MW</span>
                    <span className="text-[10px] font-mono text-[--text-secondary]">Current Total Load</span>
                  </div>

                  {/* Stacked Progress Bar */}
                  <div className="h-4 w-full rounded-full overflow-hidden flex bg-gray-800 mb-6">
                    <div style={{ width: '78%' }} className="bg-[--accent-primary] h-full" />
                    <div style={{ width: '18%' }} className="bg-amber-500 h-full" />
                    <div style={{ width: '2%' }} className="bg-purple-500 h-full" />
                    <div style={{ width: '2%' }} className="bg-gray-500 h-full" />
                  </div>

                  {/* Breakdown Legend Grid */}
                  <div className="space-y-3 font-mono text-xs">
                    {/* IT Equipment */}
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[--accent-primary] shrink-0" />
                        <span className="text-[--text-secondary]">IT Equipment (Servers, Racks)</span>
                      </div>
                      <span className="text-[--text-primary] font-semibold">1,435 kW (78%)</span>
                    </div>

                    {/* Cooling & HVAC */}
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
                        <span className="text-[--text-secondary]">Cooling & HVAC</span>
                      </div>
                      <span className="text-[--text-primary] font-semibold">331 kW (18%)</span>
                    </div>

                    {/* Lighting & Security */}
                    <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 shrink-0" />
                        <span className="text-[--text-secondary]">Lighting & Security</span>
                      </div>
                      <span className="text-[--text-primary] font-semibold">37 kW (2%)</span>
                    </div>

                    {/* System Losses */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-gray-500 shrink-0" />
                        <span className="text-[--text-secondary]">System Losses</span>
                      </div>
                      <span className="text-[--text-primary] font-semibold">37 kW (2%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Power Consumers Widget */}
            <div
              className="rounded-[10px] border flex flex-col overflow-hidden lg:col-span-3"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[--text-primary]">
                  Top Power Consumers
                </h3>
              </div>

              <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse h-full">
                  <thead>
                    <tr className="border-b text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th className="p-4 pl-5 font-semibold">Asset Group</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Current Draw</th>
                      <th className="p-4 pr-5 font-semibold text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                    {/* Row 1: IT Rack Zone A */}
                    <tr className="hover:bg-[--bg-hover]/40 transition-colors">
                      <td className="p-4 pl-5 font-semibold text-[--text-primary]">IT Rack Zone A</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-[--bg-surface] border-[--border-default] text-[--text-secondary]">
                          IT
                        </span>
                      </td>
                      <td className="p-4 text-[--text-primary] font-mono">850 kW</td>
                      <td className="p-4 pr-5 text-right font-semibold text-[--status-optimal]">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+1.2%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2: IT Rack Zone B */}
                    <tr className="hover:bg-[--bg-hover]/40 transition-colors">
                      <td className="p-4 pl-5 font-semibold text-[--text-primary]">IT Rack Zone B</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-[--bg-surface] border-[--border-default] text-[--text-secondary]">
                          IT
                        </span>
                      </td>
                      <td className="p-4 text-[--text-primary] font-mono">585 kW</td>
                      <td className="p-4 pr-5 text-right font-semibold text-[--status-optimal]">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+0.8%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3: CRAC Units (All) */}
                    <tr className="hover:bg-[--bg-hover]/40 transition-colors">
                      <td className="p-4 pl-5 font-semibold text-[--text-primary]">CRAC Units (All)</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/20 text-amber-400">
                          Cooling
                        </span>
                      </td>
                      <td className="p-4 text-[--text-primary] font-mono">300 kW</td>
                      <td className="p-4 pr-5 text-right font-semibold text-[--status-optimal]">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+14.5%</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 4: Chiller Plant */}
                    <tr className="hover:bg-[--bg-hover]/40 transition-colors">
                      <td className="p-4 pl-5 font-semibold text-[--text-primary]">Chiller Plant</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase bg-amber-500/10 border-amber-500/20 text-amber-400">
                          Cooling
                        </span>
                      </td>
                      <td className="p-4 text-[--text-primary] font-mono">80 kW</td>
                      <td className="p-4 pr-5 text-right font-semibold text-[--text-muted]">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px]">—</span>
                          <span>0.0%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        <div className="flex flex-col gap-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Open Orders Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between h-[115px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                  Open Orders
                </span>
                <div className="font-mono text-3xl font-light text-[--text-primary] mt-2">
                  12
                </div>
              </div>
            </div>

            {/* High Priority Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between h-[115px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                  High Priority
                </span>
                <div className="font-mono text-3xl font-light text-[--text-primary] mt-2">
                  3
                </div>
              </div>
            </div>

            {/* Overdue Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between h-[115px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                  Overdue
                </span>
                <div className="font-mono text-3xl font-light text-[--text-primary] mt-2">
                  1
                </div>
              </div>
            </div>

            {/* Completed (7D) Card */}
            <div
              className="rounded-[10px] border p-5 flex flex-col justify-between h-[115px]"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-widest text-[--text-secondary]">
                  Completed (7D)
                </span>
                <div className="font-mono text-3xl font-light text-[--text-primary] mt-2">
                  24
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full pb-1">
            {/* Search box */}
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[--text-muted]" />
              <input
                type="text"
                placeholder="Search work orders, assets..."
                value={orderSearch}
                onChange={(e) => {
                  setOrderSearch(e.target.value)
                  setOrderPage(1)
                }}
                className="w-full bg-[--bg-surface] border border-[--border-default] rounded-[6px] pl-9 pr-3 py-1.5 text-xs font-mono text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--border-strong] transition-all"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative font-mono" ref={orderStatusRef}>
              <button
                onClick={() => {
                  setOrderStatusOpen(!orderStatusOpen)
                  setOrderPriorityOpen(false)
                  setOrderAssigneeOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Status:</span>
                <span>{orderStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {orderStatusOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'Open', 'In Progress', 'Completed', 'Pending Parts'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setOrderStatus(opt)
                        setOrderStatusOpen(false)
                        setOrderPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {orderStatus === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Dropdown */}
            <div className="relative font-mono" ref={orderPriorityRef}>
              <button
                onClick={() => {
                  setOrderPriorityOpen(!orderPriorityOpen)
                  setOrderStatusOpen(false)
                  setOrderAssigneeOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Priority:</span>
                <span>{orderPriority}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {orderPriorityOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'Critical', 'High', 'Medium', 'Low'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setOrderPriority(opt)
                        setOrderPriorityOpen(false)
                        setOrderPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {orderPriority === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee Dropdown */}
            <div className="relative font-mono" ref={orderAssigneeRef}>
              <button
                onClick={() => {
                  setOrderAssigneeOpen(!orderAssigneeOpen)
                  setOrderStatusOpen(false)
                  setOrderPriorityOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Assignee:</span>
                <span>{orderAssignee}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {orderAssigneeOpen && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'N. Mkhize', 'D. Mbeka', 'T. Baloyi', 'Unassigned'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setOrderAssignee(opt)
                        setOrderAssigneeOpen(false)
                        setOrderPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {orderAssignee === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Work Order Button */}
            <button
              className="flex items-center gap-1.5 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold px-3.5 py-1.5 rounded-[6px] cursor-pointer ml-auto border-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>New Work Order</span>
            </button>
          </div>

          {/* Table Container */}
          <div
            className="rounded-[10px] border flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th className="p-4 pl-5 font-semibold text-left">Order Details</th>
                    <th className="p-4 font-semibold text-left">Priority</th>
                    <th className="p-4 font-semibold text-left">Status</th>
                    <th className="p-4 font-semibold text-left">Assignee</th>
                    <th className="p-4 font-semibold text-left">Due Date</th>
                    <th className="p-4 pr-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-[--text-muted]">
                        No work orders found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[--bg-hover]/40 transition-colors">
                        <td className="p-4 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[--text-primary] text-xs">{order.id}</span>
                            <span className="px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold bg-[--bg-surface] border-[--border-default] text-[--text-secondary]">
                              {order.assetCode}
                            </span>
                          </div>
                          <div className="text-[10px] text-[--text-secondary] mt-1 font-sans">
                            {order.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={getPriorityBadgeClass(order.priority)}>
                            {order.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={getOrderStatusBadgeClass(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {getAssigneeAvatar(order.assigneeName)}
                        </td>
                        <td className="p-4">
                          <span className={cn(order.dueDateIsTodayOverdue ? 'text-red-400 font-semibold' : 'text-[--text-secondary]')}>
                            {order.dueDate}
                          </span>
                        </td>
                        <td className="p-4 pr-5 text-right">
                          <button
                            className="inline-flex items-center justify-center px-3 py-1 rounded border text-[11px] font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer bg-[--bg-elevated] border-[--border-default] text-[--text-primary]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-mono text-[--text-secondary]">
                Showing {filteredOrders.length === 0 ? 0 : (orderPage - 1) * 5 + 1}-{Math.min(orderPage * 5, filteredOrders.length)} of {filteredOrders.length} work orders
              </span>

              {/* Page navigation */}
              {totalOrderPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={orderPage === 1}
                    onClick={() => setOrderPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {Array.from({ length: totalOrderPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isCurrent = orderPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setOrderPage(pageNum)}
                        className={cn(
                          'flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold transition-all cursor-pointer border',
                          isCurrent
                            ? 'bg-[--accent-primary] text-[#0A0D14] border-[--accent-primary]'
                            : 'bg-transparent border-[--border-default] text-[--text-secondary] hover:border-[--border-strong] hover:text-[--text-primary]'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    disabled={orderPage === totalOrderPages}
                    onClick={() => setOrderPage(prev => Math.min(totalOrderPages, prev + 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'alerts' ? (
        <div className="flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full pb-1">
            {/* Search box */}
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[--text-muted]" />
              <input
                type="text"
                placeholder="Search alerts by ID, asset, or description..."
                value={alertSearch}
                onChange={(e) => {
                  setAlertSearch(e.target.value)
                  setAlertPage(1)
                }}
                className="w-full bg-[--bg-surface] border border-[--border-default] rounded-[6px] pl-9 pr-3 py-1.5 text-xs font-mono text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--border-strong] transition-all"
              />
            </div>

            {/* Severity Dropdown */}
            <div className="relative font-mono" ref={alertSeverityRef}>
              <button
                onClick={() => {
                  setAlertSeverityOpen(!alertSeverityOpen)
                  setAlertStatusOpen(false)
                  setAlertAssetOpen(false)
                  setAlertDateRangeOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Severity:</span>
                <span>{alertSeverity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {alertSeverityOpen && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'Critical', 'Warning', 'Info'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAlertSeverity(opt)
                        setAlertSeverityOpen(false)
                        setAlertPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {alertSeverity === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative font-mono" ref={alertStatusRef}>
              <button
                onClick={() => {
                  setAlertStatusOpen(!alertStatusOpen)
                  setAlertSeverityOpen(false)
                  setAlertAssetOpen(false)
                  setAlertDateRangeOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Status:</span>
                <span>{alertStatus}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {alertStatusOpen && (
                <div className="absolute left-0 mt-1.5 w-48 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['All', 'Active & Ack', 'Active', 'Acknowledged', 'Resolved'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAlertStatus(opt)
                        setAlertStatusOpen(false)
                        setAlertPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {alertStatus === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Dropdown */}
            <div className="relative font-mono" ref={alertAssetRef}>
              <button
                onClick={() => {
                  setAlertAssetOpen(!alertAssetOpen)
                  setAlertSeverityOpen(false)
                  setAlertStatusOpen(false)
                  setAlertDateRangeOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <span className="text-[--text-secondary]">Asset:</span>
                <span>{alertAsset}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {alertAssetOpen && (
                <div className="absolute left-0 mt-1.5 w-48 max-h-60 overflow-y-auto rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 py-1">
                  {alertAssetOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAlertAsset(opt)
                        setAlertAssetOpen(false)
                        setAlertPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {alertAsset === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Dropdown */}
            <div className="relative font-mono ml-auto" ref={alertDateRangeRef}>
              <button
                onClick={() => {
                  setAlertDateRangeOpen(!alertDateRangeOpen)
                  setAlertSeverityOpen(false)
                  setAlertStatusOpen(false)
                  setAlertAssetOpen(false)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-surface] text-xs text-[--text-primary] hover:border-[--border-strong] cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[--text-muted]" />
                <span>{alertDateRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
              </button>
              {alertDateRangeOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-[10px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl z-50 overflow-hidden py-1">
                  {['Last 7 Days', 'Last 24 Hours', 'Last 30 Days', 'Custom Range'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAlertDateRange(opt)
                        setAlertDateRangeOpen(false)
                        setAlertPage(1)
                      }}
                      className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left text-[--text-primary] hover:bg-[--bg-hover] transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>{opt}</span>
                      {alertDateRange === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div
            className="rounded-[10px] border flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th className="p-4 pl-5 font-semibold text-left">Severity</th>
                    <th className="p-4 font-semibold text-left">Alert Description</th>
                    <th className="p-4 font-semibold text-left">Asset</th>
                    <th className="p-4 font-semibold text-left">Metric</th>
                    <th className="p-4 font-semibold text-left">Status</th>
                    <th className="p-4 font-semibold text-left">Timestamp</th>
                    <th className="p-4 pr-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                  {paginatedAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-[--text-muted]">
                        No alerts found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-[--bg-hover]/40 transition-colors">
                        <td className="p-4 pl-5 align-middle">
                          <span className={getSeverityBadgeClass(alert.severity)}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-semibold text-[--text-primary] text-xs">
                            {alert.description}
                          </div>
                          {alert.subDescription && (
                            <div className="text-[10px] text-[--text-secondary] mt-0.5 font-sans">
                              {alert.subDescription}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <span className="px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold bg-[--bg-surface] border-[--border-default] text-[--text-secondary] inline-block">
                            {alert.assetCode}
                          </span>
                          <div className="text-[10px] text-[--text-secondary] mt-0.5 font-sans">
                            {alert.assetName}
                          </div>
                        </td>
                        <td className={cn("p-4 align-middle font-semibold font-mono", getMetricClass(alert.severity, alert.status))}>
                          {alert.metric}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-1.5">
                            {getAlertStatusDot(alert.status)}
                            <span className="text-[--text-primary]">{alert.status}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-[--text-secondary]">
                          {alert.timestamp}
                        </td>
                        <td className="p-4 pr-5 align-middle text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {alert.status === 'Active' && (
                              <button className="px-3 py-1 rounded border text-[11px] font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer bg-[--bg-elevated] border-[--border-default] text-[--text-primary]">
                                Acknowledge
                              </button>
                            )}
                            {alert.status === 'Acknowledged' && (
                              <button className="px-3 py-1 rounded border text-[11px] font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer bg-[--bg-elevated] border-[--border-default] text-[--text-primary]">
                                Resolve
                              </button>
                            )}
                            {alert.status === 'Resolved' && (
                              <button className="text-[11px] font-mono font-medium hover:underline text-[--text-primary] bg-transparent border-0 cursor-pointer">
                                Details
                              </button>
                            )}
                            <button className="inline-flex items-center justify-center p-1 text-[--text-muted] hover:text-[--text-primary] bg-transparent border-0 cursor-pointer">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="text-[10px] font-mono text-[--text-secondary]">
                Showing {filteredAlerts.length === 0 ? 0 : (alertPage - 1) * 6 + 1}-{Math.min(alertPage * 6, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </span>

              {/* Page navigation */}
              {totalAlertPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={alertPage === 1}
                    onClick={() => setAlertPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  
                  {Array.from({ length: totalAlertPages }).map((_, i) => {
                    const pageNum = i + 1
                    const isCurrent = alertPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setAlertPage(pageNum)}
                        className={cn(
                          'flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold transition-all cursor-pointer border',
                          isCurrent
                            ? 'bg-[--accent-primary] text-[#0A0D14] border-[--accent-primary]'
                            : 'bg-transparent border-[--border-default] text-[--text-secondary] hover:border-[--border-strong] hover:text-[--text-primary]'
                        )}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    disabled={alertPage === totalAlertPages}
                    onClick={() => setAlertPage(prev => Math.min(totalAlertPages, prev + 1))}
                    className="flex items-center justify-center w-7 h-7 rounded border border-[--border-default] bg-[--bg-surface] text-[--text-primary] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[--border-strong] cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Alternate Tab Page Placeholder rendering to make tabs fully interactive */
        <div
          className="rounded-[10px] border p-12 flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <Cpu className="w-12 h-12 text-muted-foreground mb-4 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-mono text-sm font-semibold tracking-wide mb-1.5" style={{ color: 'var(--text-primary)' }}>
            {String(activeTab).toUpperCase()} Section
          </h3>
          <p className="text-xs font-mono max-w-sm mb-5 leading-normal" style={{ color: 'var(--text-secondary)' }}>
            You are viewing the {String(activeTab)} panel for {baseFacility.name}. High-fidelity metrics are compiled in the Overview dashboard.
          </p>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <span>Return to Overview</span>
          </button>
        </div>
      )}
    </div>
  )
}
