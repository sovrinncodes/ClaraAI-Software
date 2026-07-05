import type { Metadata } from 'next'
import { AssetHistoryView } from '@/components/equipment/asset-history-view'

export const metadata: Metadata = { title: 'Historical Log' }

interface PageProps {
  params: Promise<{ assetId: string }>
}

export default async function AssetHistoryPage({ params }: PageProps) {
  const { assetId } = await params
  return <AssetHistoryView assetId={assetId} />
}
