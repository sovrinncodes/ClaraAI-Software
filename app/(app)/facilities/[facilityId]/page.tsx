import type { Metadata } from 'next'
import { FacilityDetailsView } from '@/components/facilities/facility-details-view'

export const metadata: Metadata = { title: 'Facility Detail' }

interface PageProps {
  params: Promise<{ facilityId: string }>
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { facilityId } = await params
  return <FacilityDetailsView facilityId={facilityId} />
}

