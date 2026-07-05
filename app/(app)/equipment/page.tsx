import type { Metadata } from 'next'
import { EquipmentHealthView } from '@/components/equipment/equipment-health-view'

export const metadata: Metadata = { title: 'Equipment Health' }

export default function EquipmentPage() {
  return <EquipmentHealthView />
}
