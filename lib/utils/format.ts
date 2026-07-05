export function formatHealthScore(score: number): string {
  return `${score.toFixed(1)}%`
}

export function formatPue(pue: number): string {
  return pue.toFixed(2)
}

export function formatEnergy(kw: number): string {
  if (kw >= 1000) return `${(kw / 1000).toFixed(1)} MW`
  return `${kw.toFixed(0)} kW`
}

export function formatEnergyKwh(kwh: number): string {
  if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`
  return `${kwh.toFixed(0)} kWh`
}

export function formatZar(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUtcTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC'
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function getHealthColor(score: number): string {
  if (score >= 90) return 'text-green-400'
  if (score >= 70) return 'text-amber-400'
  return 'text-red-400'
}

export function getHealthBgColor(score: number): string {
  if (score >= 90) return 'bg-green-400'
  if (score >= 70) return 'bg-amber-400'
  return 'bg-red-400'
}
