export type WorkOrderPriority = 'Critical' | 'High' | 'Medium' | 'Low'
export type WorkOrderStatus = 'Open' | 'In Progress' | 'Completed' | 'Pending Parts'

export interface ActivityLogEntry {
  timestamp: string
  title: string
  subtitle: string
}

export interface WorkOrderPart {
  partNumber: string
  description: string
  status: 'In Stock' | 'Out of Stock' | 'Procured' | 'Requested'
}

export interface WorkOrderSourceAlert {
  title: string
  time: string
  metric: string
}

export interface WorkOrderAiInsight {
  text: string
  predictedTtfDays: number
  confidence: number
}

export interface WorkOrder {
  id: string
  title: string
  assetId: string
  assetCode: string
  assetName: string
  facilityId: string
  facilityName: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  assigneeName: string
  assigneeAvatar?: string
  dueDate: string
  description: string
  tasks: string[]
  parts?: WorkOrderPart[]
  sourceAlert?: WorkOrderSourceAlert
  aiInsight?: WorkOrderAiInsight
  createdAt: string
  activityLog: ActivityLogEntry[]
}
