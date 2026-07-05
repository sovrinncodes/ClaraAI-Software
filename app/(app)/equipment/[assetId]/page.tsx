import type { Metadata } from 'next'
import { AssetDetailsView } from '@/components/equipment/asset-details-view'

export const metadata: Metadata = { title: 'Asset Detail' }

interface PageProps {
  params: Promise<{ assetId: string }>
}

export default async function AssetDetailPage({ params }: PageProps) {
  const { assetId } = await params
  return <AssetDetailsView assetId={assetId} />
}

