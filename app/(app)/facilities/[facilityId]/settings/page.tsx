import type { Metadata } from 'next'
import { ManageFacilityView } from '@/components/facilities/manage-facility-view'

export const metadata: Metadata = { title: 'Manage Facility' }

interface PageProps {
  params: Promise<{ facilityId: string }>
}

export default async function ManageFacilityPage({ params }: PageProps) {
  const { facilityId } = await params
  return <ManageFacilityView facilityId={facilityId} />
}
