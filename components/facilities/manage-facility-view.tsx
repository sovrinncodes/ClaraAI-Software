'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ChevronDown,
  Settings2,
  Cpu,
  Bell,
  Users,
  Check,
  Copy,
  Plus,
  Trash2,
  Play,
  Pause,
  Shield,
  MapPin,
  Briefcase,
  AlertTriangle,
  Loader2,
  Sparkles,
  Info,
  Key,
  Network,
  Webhook,
  Terminal,
  Maximize2,
  Minimize2,
  RefreshCw,
  MoreVertical,
  ExternalLink,
  BookOpen,
  Mail,
  Layers,
  FileText,
  Link2,
  UserPlus
} from 'lucide-react'
import { DEMO_FACILITIES } from '@/lib/data/seed'
import { cn } from '@/lib/utils/cn'

// Custom Slack Icon component since it may not be in the current lucide-react version
const Slack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="13.5" y="2" width="3" height="8" rx="1.5" />
    <path d="M16 8.5H21A1.5 1.5 0 0 1 22.5 10A1.5 1.5 0 0 1 21 11.5H16A1.5 1.5 0 0 1 14.5 10A1.5 1.5 0 0 1 16 8.5z" />
    <rect x="13.5" y="14" width="3" height="8" rx="1.5" />
    <path d="M16 15.5H21A1.5 1.5 0 0 1 22.5 17A1.5 1.5 0 0 1 21 18.5H16A1.5 1.5 0 0 1 14.5 17A1.5 1.5 0 0 1 16 15.5z" />
    <rect x="7.5" y="14" width="3" height="8" rx="1.5" />
    <path d="M8 15.5H3A1.5 1.5 0 0 0 1.5 17A1.5 1.5 0 0 0 3 18.5H8A1.5 1.5 0 0 0 9.5 17A1.5 1.5 0 0 0 8 15.5z" />
    <rect x="7.5" y="2" width="3" height="8" rx="1.5" />
    <path d="M8 8.5H3A1.5 1.5 0 0 0 1.5 10A1.5 1.5 0 0 0 3 11.5H8A1.5 1.5 0 0 0 9.5 10A1.5 1.5 0 0 0 8 8.5z" />
  </svg>
)


interface ManageFacilityViewProps {
  facilityId: string
}

interface TeamMember {
  id: string
  name: string
  role: 'Admin (Inherited)' | 'Facility Manager' | 'Viewer'
  email: string
  status: 'Active' | 'Pending'
  avatarUrl?: string
  isLocked?: boolean
}

interface WebhookItem {
  id: string
  name: string
  url: string
  events: string[]
  status: 'Healthy' | 'Failing' | 'Inactive'
}

interface IngestionLog {
  timestamp: string
  method: 'POST' | 'MQTT'
  path: string
  status: '201 OK' | 'ACK'
  payload: string
}

export function ManageFacilityView({ facilityId }: ManageFacilityViewProps) {
  const router = useRouter()
  const baseFacility = useMemo(() => {
    return DEMO_FACILITIES.find((f) => f.id === facilityId) || DEMO_FACILITIES[0]
  }, [facilityId])

  // Active Tab state: 'general' | 'telemetry' | 'alerts' | 'team'
  const [activeTab, setActiveTab] = useState<'general' | 'telemetry' | 'alerts' | 'team'>('general')

  // Form states - General Info
  const [facilityName, setFacilityName] = useState(baseFacility.name)
  const [externalId, setExternalId] = useState(baseFacility.externalId)
  const [locationStr, setLocationStr] = useState(
    facilityId === 'fac_jhb_dc_01'
      ? 'Gauteng, RSA'
      : facilityId === 'fac_cpt_mfg_01'
      ? 'Western Cape, RSA'
      : facilityId === 'fac_pta_hq_01'
      ? 'Gauteng, RSA'
      : 'KwaZulu-Natal, RSA'
  )

  // Timezone selector custom state
  const [timezone, setTimezone] = useState('Africa/Johannesburg (SAST)')
  const [timezoneOpen, setTimezoneOpen] = useState(false)
  const timezoneRef = useRef<HTMLDivElement>(null)
  const timezones = [
    'Africa/Johannesburg (SAST)',
    'Europe/London (GMT)',
    'America/New_York (EST)',
    'Asia/Tokyo (JST)',
    'Europe/Paris (CET)'
  ]

  // Facility Type selector custom state
  const [facilityType, setFacilityType] = useState(
    baseFacility.type === 'DATA_CENTER'
      ? 'Data Center'
      : baseFacility.type === 'MANUFACTURING'
      ? 'Manufacturing'
      : baseFacility.type === 'COMMERCIAL'
      ? 'Commercial'
      : 'Logistics'
  )
  const [typeOpen, setTypeOpen] = useState(false)
  const typeRef = useRef<HTMLDivElement>(null)
  const facilityTypes = ['Data Center', 'Manufacturing', 'Commercial', 'Logistics']

  // Telemetry Connection state
  const [isProcessing, setIsProcessing] = useState(true)
  const [apiKey, setApiKey] = useState('cpt_sk_live_9f8d7x_k92jdm1039nf84hf')
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedTenantId, setCopiedTenantId] = useState(false)
  const [copiedMqttHost, setCopiedMqttHost] = useState(false)
  const [copiedMqttTopic, setCopiedMqttTopic] = useState(false)
  
  // Modals state
  const [showRotateModal, setShowRotateModal] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [isPausingTask, setIsPausingTask] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Alert Routing states
  const [critEmail, setCritEmail] = useState(true)
  const [critPush, setCritPush] = useState(true)
  const [critSMS, setCritSMS] = useState(true)

  const [warnEmail, setWarnEmail] = useState(true)
  const [warnPush, setWarnPush] = useState(true)
  const [warnSMS, setWarnSMS] = useState(false)

  const [advEmail, setAdvEmail] = useState(true)
  const [advPush, setAdvPush] = useState(false)
  const [advSMS, setAdvSMS] = useState(false)

  const [defaultAssignee, setDefaultAssignee] = useState('Sipho Ndlovu')
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const assigneeRef = useRef<HTMLDivElement>(null)
  const assignees = ['Sipho Ndlovu', 'Thandiwe Mbeki', 'Jane Doe', 'Unassigned']

  const [escalationTimeout, setEscalationTimeout] = useState('30 Minutes')
  const [timeoutOpen, setTimeoutOpen] = useState(false)
  const timeoutRef = useRef<HTMLDivElement>(null)
  const timeouts = ['15 Minutes', '30 Minutes', '60 Minutes', '2 Hours']

  const [escalateTo, setEscalateTo] = useState('On-Call Engineer')
  const [escalateToOpen, setEscalateToOpen] = useState(false)
  const escalateToRef = useRef<HTMLDivElement>(null)
  const escalateToOptions = ['On-Call Engineer', 'Facility Manager', 'Operations Director']

  // Webhooks & Integrations state
  interface IntegrationItem {
    id: string
    name: string
    channel: string
    status: 'Active' | 'Inactive'
    description: string
    type: 'slack' | 'pagerduty'
  }

  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'int-1',
      name: 'Slack',
      channel: '#jhb-dc-alerts',
      status: 'Active',
      description: 'Receives Critical and Warning alerts.',
      type: 'slack'
    },
    {
      id: 'int-2',
      name: 'PagerDuty',
      channel: 'High Urgency',
      status: 'Inactive',
      description: 'Triggers incidents for Critical alerts only.',
      type: 'pagerduty'
    }
  ])

  // Outbound Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    {
      id: 'wh-1',
      name: 'SAP ERP Maintenance Sync',
      url: 'https://erp.cpt.local/api/clara-webhook',
      events: ['alert.critical', 'alert.resolved'],
      status: 'Healthy'
    }
  ])
  const [showAddWebhook, setShowAddWebhook] = useState(false)
  const [whName, setWhName] = useState('')
  const [whUrl, setWhUrl] = useState('')
  const [whEvents, setWhEvents] = useState<string[]>(['alert.critical', 'alert.resolved'])

  // Ingestion Logs state
  const [streaming, setStreaming] = useState(true)
  const [isLogExpanded, setIsLogExpanded] = useState(false)
  const [logs, setLogs] = useState<IngestionLog[]>([
    {
      timestamp: '14:02:35.110',
      method: 'MQTT',
      path: `telemetry/${baseFacility.externalId}/CHILLER-01/data`,
      status: 'ACK',
      payload: JSON.stringify({
        timestamp: new Date(Date.now() - 6000).toISOString(),
        metrics: {
          chiller_temp_in: 12.1,
          chiller_temp_out: 7.0,
          vibration_rms: 0.32,
          compressor_load: 72.8
        }
      }, null, 2)
    },
    {
      timestamp: '14:02:41.052',
      method: 'POST',
      path: `/v1/ingest/${baseFacility.externalId}/CRAC-A`,
      status: '201 OK',
      payload: JSON.stringify({
        timestamp: new Date(Date.now() - 3000).toISOString(),
        metrics: {
          supply_temp_c: 22.4,
          return_temp_c: 28.1,
          vibration_rms: 0.42,
          fan_speed_rpm: 1450
        }
      }, null, 2)
    }
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Team Access states
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Thandiwe Mbeki',
      email: 'thandiwe@cpt.com',
      role: 'Admin (Inherited)',
      status: 'Active',
      avatarUrl: '/avatar_thandiwe.png',
      isLocked: true
    },
    {
      id: '2',
      name: 'Sipho Ndlovu',
      email: 'sipho.n@cpt.com',
      role: 'Facility Manager',
      status: 'Active',
      avatarUrl: '/avatar_sipho.png',
      isLocked: false
    },
    {
      id: '3',
      name: 'Jane Doe',
      email: 'jane.doe@partner-inc.com',
      role: 'Viewer',
      status: 'Pending',
      isLocked: false
    }
  ])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'Facility Manager' | 'Viewer'>('Facility Manager')
  const [inviteRoleOpen, setInviteRoleOpen] = useState(false)
  const inviteRoleRef = useRef<HTMLDivElement>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null)

  // Save changes loader state
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Click away handlers for custom dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timezoneRef.current && !timezoneRef.current.contains(event.target as Node)) {
        setTimezoneOpen(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeOpen(false)
      }
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setAssigneeOpen(false)
      }
      if (timeoutRef.current && !timeoutRef.current.contains(event.target as Node)) {
        setTimeoutOpen(false)
      }
      if (escalateToRef.current && !escalateToRef.current.contains(event.target as Node)) {
        setEscalateToOpen(false)
      }
      if (inviteRoleRef.current && !inviteRoleRef.current.contains(event.target as Node)) {
        setInviteRoleOpen(false)
      }
      setActiveRoleDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto Scroll Terminal Logs to Bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  // Background Ingestion Logs Stream Simulator
  useEffect(() => {
    if (!streaming || !isProcessing) return

    const interval = setInterval(() => {
      const now = new Date()
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + now.getMilliseconds().toString().padStart(3, '0')
      
      const assetsList = ['CRAC-A', 'CHILLER-01', 'UPS-B', 'AHU-04']
      const asset = assetsList[Math.floor(Math.random() * assetsList.length)]
      const isMqtt = Math.random() > 0.4
      
      let payload = {}
      if (asset === 'CRAC-A') {
        payload = {
          timestamp: now.toISOString(),
          metrics: {
            supply_temp_c: parseFloat((21 + Math.random() * 3).toFixed(1)),
            return_temp_c: parseFloat((26 + Math.random() * 4).toFixed(1)),
            vibration_rms: parseFloat((0.3 + Math.random() * 0.2).toFixed(2)),
            fan_speed_rpm: Math.floor(1400 + Math.random() * 100)
          }
        }
      } else if (asset === 'CHILLER-01') {
        payload = {
          timestamp: now.toISOString(),
          metrics: {
            chiller_temp_in: parseFloat((11 + Math.random() * 2).toFixed(1)),
            chiller_temp_out: parseFloat((6 + Math.random() * 2).toFixed(1)),
            vibration_rms: parseFloat((0.2 + Math.random() * 0.2).toFixed(2)),
            compressor_load: parseFloat((70 + Math.random() * 10).toFixed(1))
          }
        }
      } else if (asset === 'UPS-B') {
        payload = {
          timestamp: now.toISOString(),
          metrics: {
            ups_input_voltage: parseFloat((400 + Math.random() * 5).toFixed(1)),
            ups_output_voltage: parseFloat((398 + Math.random() * 4).toFixed(1)),
            battery_charge_pct: parseFloat((98 + Math.random() * 2).toFixed(1)),
            load_factor: parseFloat((0.55 + Math.random() * 0.1).toFixed(2))
          }
        }
      } else {
        payload = {
          timestamp: now.toISOString(),
          metrics: {
            pdu_active_power_kw: parseFloat((800 + Math.random() * 100).toFixed(1)),
            pue_ratio: parseFloat((1.21 + Math.random() * 0.05).toFixed(2)),
            carbon_footprint_kg_hr: parseFloat((340 + Math.random() * 30).toFixed(1))
          }
        }
      }

      const newLog: IngestionLog = {
        timestamp,
        method: isMqtt ? 'MQTT' : 'POST',
        path: isMqtt ? `telemetry/${baseFacility.externalId}/${asset}/data` : `/v1/ingest/${baseFacility.externalId}/${asset}`,
        status: isMqtt ? 'ACK' : '201 OK',
        payload: JSON.stringify(payload, null, 2)
      }

      setLogs((prev) => [...prev.slice(-14), newLog]) // Keep last 15 items
    }, 4000)

    return () => clearInterval(interval)
  }, [streaming, isProcessing, baseFacility.externalId])

  // Copy Actions
  const handleCopyText = (text: string, setCopiedState: (v: boolean) => void, toastMsg: string) => {
    navigator.clipboard.writeText(text)
    setCopiedState(true)
    showToast(toastMsg)
    setTimeout(() => setCopiedState(false), 2000)
  }

  // Rotate Key Handler
  const handleRotateKey = () => {
    setIsRotating(true)
    setTimeout(() => {
      const randStr = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
      setApiKey(`cpt_sk_live_${randStr}`)
      setIsRotating(false)
      setShowRotateModal(false)
      showToast('API Key rotated successfully')
    }, 1200)
  }

  // Pause telemetry handler
  const handlePauseTelemetry = () => {
    setIsPausingTask(true)
    setTimeout(() => {
      setIsProcessing(!isProcessing)
      setIsPausingTask(false)
      setShowPauseModal(false)
      showToast(isProcessing ? 'Telemetry stream paused' : 'Telemetry stream resumed')
    }, 1000)
  }

  // Delete facility handler
  const handleDeleteFacility = () => {
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      setShowDeleteModal(false)
      router.push('/facilities')
    }, 1500)
  }

  // Save changes handler
  const handleSaveChanges = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      showToast('Facility settings updated successfully')
      setTimeout(() => {
        router.push(`/facilities/${facilityId}`)
      }, 1000)
    }, 1500)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Add user handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteName) return
    setIsInviting(true)
    setTimeout(() => {
      const newUser: TeamMember = {
        id: Date.now().toString(),
        name: inviteName,
        role: inviteRole,
        email: inviteEmail,
        status: 'Pending',
        isLocked: false
      }
      setTeam([...team, newUser])
      setInviteName('')
      setInviteEmail('')
      setInviteRole('Facility Manager')
      setIsInviting(false)
      setShowInviteModal(false)
      showToast(`Invitation sent to ${inviteEmail}`)
    }, 800)
  }

  const handleRemoveUser = (id: string) => {
    const member = team.find((m) => m.id === id)
    if (member && member.isLocked) {
      showToast('Cannot remove the facility administrator')
      return
    }
    setTeam(team.filter((m) => m.id !== id))
    showToast('Team member removed')
  }

  // Webhook handlers
  const handleAddWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!whName || !whUrl) return
    const newWh: WebhookItem = {
      id: Date.now().toString(),
      name: whName,
      url: whUrl,
      events: whEvents,
      status: 'Healthy'
    }
    setWebhooks([...webhooks, newWh])
    setWhName('')
    setWhUrl('')
    setWhEvents(['alert.critical', 'alert.resolved'])
    setShowAddWebhook(false)
    showToast(`Webhook "${whName}" created successfully`)
  }

  const handleRemoveWebhook = (id: string) => {
    setWebhooks(webhooks.filter((wh) => wh.id !== id))
    showToast('Webhook endpoint deleted')
  }

  const handleToggleWebhookEvent = (ev: string) => {
    if (whEvents.includes(ev)) {
      setWhEvents(whEvents.filter((item) => item !== ev))
    } else {
      setWhEvents([...whEvents, ev])
    }
  }

  // Helper to colorize JSON code lines for console output
  const formatJSONLog = (jsonStr: string) => {
    return jsonStr.split('\n').map((line, idx) => {
      const keyRegex = /^(\s*)"([^"]+)":/
      const valStrRegex = /"([^"]+)"(,?)$/
      
      const keyMatch = line.match(keyRegex)
      if (keyMatch) {
        const indent = keyMatch[1]
        const key = keyMatch[2]
        const rest = line.substring(keyMatch[0].length)
        
        return (
          <div key={idx} className="flex select-text leading-relaxed">
            <span className="whitespace-pre text-zinc-600">{indent}</span>
            <span className="text-[#80cbc4]">"{key}"</span>
            <span className="text-zinc-400">:</span>
            {rest.includes('"') ? (
              <span className="text-[#a5d6a7] ml-1">{rest}</span>
            ) : rest.match(/[0-9]/) ? (
              <span className="text-[#ffe082] ml-1">{rest}</span>
            ) : (
              <span className="text-zinc-300 ml-1">{rest}</span>
            )}
          </div>
        )
      }
      
      return (
        <div key={idx} className="whitespace-pre text-zinc-400 select-text leading-relaxed">
          {line}
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border border-[--accent-primary]/20 bg-[--bg-surface] shadow-[0_4px_24px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-[--accent-primary]" />
          <span className="font-mono text-xs text-[--text-primary]">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[--text-secondary]">
        <Link href="/facilities" className="hover:text-[--text-primary] transition-colors">
          Facilities
        </Link>
        <span className="text-[--text-muted] select-none">/</span>
        <Link href={`/facilities/${facilityId}`} className="hover:text-[--text-primary] transition-colors">
          {baseFacility.name}
        </Link>
        <span className="text-[--text-muted] select-none">/</span>
        <span className="text-[--text-muted]">Settings</span>
      </div>

      {/* Header & Main buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1 animate-in fade-in duration-300">
            Manage Facility
          </h1>
          <p className="text-xs font-mono text-[--text-secondary]">
            Configure settings, integrations, and alerts for {baseFacility.name}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {activeTab === 'telemetry' ? (
            <button
              onClick={() => showToast('Redirecting to API documentation...')}
              className="px-3.5 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer bg-transparent border-[--border-default] text-[--text-primary]"
            >
              View API Docs
            </button>
          ) : (
            <button
              onClick={() => router.push(`/facilities/${facilityId}`)}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-[--border-strong] cursor-pointer bg-[--bg-elevated] border-[--border-default] text-[--text-primary] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-mono text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* Split layout: left navigation sidebar + right content cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Settings Navigation Sidebar */}
        <div className="md:col-span-3 space-y-1 sticky top-20 z-10 bg-[--bg-base]/80 backdrop-blur-sm p-1 rounded-lg border border-[--border-subtle] md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-lg transition-all text-left shrink-0 w-full cursor-pointer',
                activeTab === 'general'
                  ? 'bg-[rgba(0,212,170,0.06)] text-[--accent-primary] font-medium'
                  : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
              )}
            >
              <FileText className={cn('w-3.5 h-3.5', activeTab === 'general' ? 'text-[--accent-primary]' : 'text-[--text-muted]')} />
              <span>General Information</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-lg transition-all text-left shrink-0 w-full cursor-pointer',
                activeTab === 'telemetry'
                  ? 'bg-[rgba(0,212,170,0.06)] text-[--accent-primary] font-medium'
                  : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
              )}
            >
              <Network className={cn('w-3.5 h-3.5', activeTab === 'telemetry' ? 'text-[--accent-primary]' : 'text-[--text-muted]')} />
              <span>Telemetry & API</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-lg transition-all text-left shrink-0 w-full cursor-pointer',
                activeTab === 'alerts'
                  ? 'bg-[rgba(0,212,170,0.06)] text-[--accent-primary] font-medium'
                  : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
              )}
            >
              <Bell className={cn('w-3.5 h-3.5', activeTab === 'alerts' ? 'text-[--accent-primary]' : 'text-[--text-muted]')} />
              <span>Alert Routing</span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-lg transition-all text-left shrink-0 w-full cursor-pointer',
                activeTab === 'team'
                  ? 'bg-[rgba(0,212,170,0.06)] text-[--accent-primary] font-medium'
                  : 'text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]'
              )}
            >
              <Users className={cn('w-3.5 h-3.5', activeTab === 'team' ? 'text-[--accent-primary]' : 'text-[--text-muted]')} />
              <span>Team Access</span>
            </button>
          </div>
        </div>

        {/* Right Content Pane */}
        <div className="md:col-span-9 space-y-6 pb-20">
          
          {/* ========================================================================= */}
          {/* TAB 1: GENERAL INFORMATION */}
          {/* ========================================================================= */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Card 1: General Info */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="border-b border-[--border-subtle] pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    General Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Facility Name
                    </label>
                    <input
                      type="text"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Facility ID
                    </label>
                    <input
                      type="text"
                      value={externalId}
                      disabled
                      className="w-full px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default]/50 rounded text-[--text-muted] cursor-not-allowed opacity-70"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Location (City, Region)
                    </label>
                    <input
                      type="text"
                      value={locationStr}
                      onChange={(e) => setLocationStr(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Timezone
                    </label>
                    <div className="relative" ref={timezoneRef}>
                      <button
                        type="button"
                        onClick={() => setTimezoneOpen(!timezoneOpen)}
                        className="flex justify-between items-center w-full px-3 py-2 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors cursor-pointer text-left"
                      >
                        <span>{timezone}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                      </button>

                      {timezoneOpen && (
                        <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                          {timezones.map((tz) => (
                            <button
                              key={tz}
                              type="button"
                              onClick={() => {
                                setTimezone(tz)
                                setTimezoneOpen(false)
                              }}
                              className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-mono hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                            >
                              <span>{tz}</span>
                              {timezone === tz && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Facility Type
                    </label>
                    <div className="relative" ref={typeRef}>
                      <button
                        type="button"
                        onClick={() => setTypeOpen(!typeOpen)}
                        className="flex justify-between items-center w-full px-3 py-2 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors cursor-pointer text-left"
                      >
                        <span>{facilityType}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                      </button>

                      {typeOpen && (
                        <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                          {facilityTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFacilityType(type)
                                setTypeOpen(false)
                              }}
                              className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-mono hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                            >
                              <span>{type}</span>
                              {facilityType === type && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Telemetry & Integration Summary */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Telemetry & Integration Summary
                  </h3>
                  
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider',
                    isProcessing 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  )}>
                    <span className={cn("w-1 h-1 rounded-full", isProcessing ? "bg-green-400" : "bg-red-400")} />
                    <span>{isProcessing ? 'Active Connection' : 'Telemetry Paused'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      Ingestion Endpoint
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`https://api.clara.ai/v1/ingest/${externalId}`}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(`https://api.clara.ai/v1/ingest/${externalId}`, setCopiedEndpoint, 'Ingestion URL copied')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                      >
                        {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary]">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={copiedKey ? apiKey : apiKey.substring(0, 16) + '...'}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(apiKey, setCopiedKey, 'API Key copied')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9.5px] font-mono text-[--text-muted]">
                        To access full credentials, webhooks, and raw ingestion streams, click Telemetry & API.
                      </span>
                      <button
                        onClick={() => setActiveTab('telemetry')}
                        className="text-[10px] font-mono font-bold text-[--accent-primary] hover:underline cursor-pointer"
                      >
                        Manage Telemetry
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Alert Routing Summary */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="border-b border-[--border-subtle] pb-3.5 flex justify-between items-center">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Alert Routing
                  </h3>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-[10px] font-mono font-bold text-[--accent-primary] hover:underline cursor-pointer"
                  >
                    Manage Routing
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase text-[--text-secondary]">Critical Alerts Routing</span>
                    <div className="flex gap-3 text-[--text-primary]">
                      <span className={cn(critEmail ? "text-[--accent-primary]" : "text-[--text-muted]")}>Email</span>
                      <span className="text-[--border-default]">•</span>
                      <span className={cn(critPush ? "text-[--accent-primary]" : "text-[--text-muted]")}>Push</span>
                      <span className="text-[--border-default]">•</span>
                      <span className={cn(critSMS ? "text-[--accent-primary]" : "text-[--text-muted]")}>SMS</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase text-[--text-secondary]">Default Assignee</span>
                    <div className="text-[--text-primary] font-semibold">{defaultAssignee}</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Danger Zone */}
              <div className="rounded-[10px] border border-red-500/20 bg-red-500/5 p-6 space-y-5">
                <div className="border-b border-red-500/10 pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-red-400">
                    Danger Zone
                  </h3>
                </div>

                <div className="divide-y divide-red-500/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold text-[--text-primary]">Pause Telemetry Processing</h4>
                      <p className="text-[10px] font-mono text-[--text-secondary] max-w-lg">
                        Temporarily stop evaluating incoming data for this facility. No new alerts or insights will be generated.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowPauseModal(true)}
                      className="px-3.5 py-1.5 rounded-md border text-xs font-mono font-medium transition-colors hover:border-red-500/40 hover:bg-red-500/5 bg-[--bg-elevated] border-[--border-default] text-[--text-primary] cursor-pointer whitespace-nowrap"
                    >
                      {isProcessing ? 'Pause Processing' : 'Resume Processing'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono font-bold text-[--text-primary]">Delete Facility</h4>
                      <p className="text-[10px] font-mono text-[--text-secondary] max-w-lg">
                        Permanently remove this facility and all associated assets, history, and alerts. This action cannot be undone.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3.5 py-1.5 rounded-[6px] bg-red-600 hover:bg-red-700 transition-colors text-white font-mono text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      Delete Facility
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TELEMETRY & API (MATCHING NEW MOCKUP) */}
          {/* ========================================================================= */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Card 1: API Authentication */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[--accent-primary]" />
                    <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                      API Authentication
                    </h3>
                  </div>
                  
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider',
                    isProcessing 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  )}>
                    <span className={cn("w-1 h-1 rounded-full", isProcessing ? "bg-green-400" : "bg-red-400")} />
                    <span>{isProcessing ? 'Active Connection' : 'Telemetry Paused'}</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Facility API Key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary] block">
                      Facility API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={copiedKey ? apiKey : apiKey.substring(0, 16) + '...'}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(apiKey, setCopiedKey, 'API Key copied to clipboard')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                        title="Copy API Key"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="text-[9.5px] font-mono text-[--text-muted] max-w-xl leading-normal">
                        Include this key in the <code className="text-[--text-primary] px-1 bg-[--bg-card] rounded">Authorization: Bearer</code> header for all requests to Clara AI endpoints.
                      </span>
                      <button
                        onClick={() => setShowRotateModal(true)}
                        className="flex items-center gap-1 text-[10px] font-mono font-bold text-[--status-advisory] hover:text-[--status-advisory]/80 cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Rotate API Key</span>
                      </button>
                    </div>
                  </div>

                  {/* Tenant ID Header */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary] block">
                      Tenant ID Header
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="req_tenant_a8f92"
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText('req_tenant_a8f92', setCopiedTenantId, 'Tenant ID copied to clipboard')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                        title="Copy Tenant ID"
                      >
                        {copiedTenantId ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    <span className="text-[9.5px] font-mono text-[--text-muted] block leading-normal">
                      Required for multi-tenant isolation. Pass via <code className="text-[--text-primary] px-1 bg-[--bg-card] rounded">x-tenant-id</code>.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Ingestion Endpoints */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="border-b border-[--border-subtle] pb-3.5 flex items-center gap-2">
                  <Network className="w-4 h-4 text-[--accent-primary]" />
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Ingestion Endpoints
                  </h3>
                </div>

                <div className="space-y-5">
                  {/* REST API Ingestion URL */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary] block">
                      REST API (Bulk / Batch)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`https://api.clara.ai/v1/ingest/${baseFacility.externalId}`}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(`https://api.clara.ai/v1/ingest/${baseFacility.externalId}`, setCopiedEndpoint, 'REST API Endpoint copied')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                      >
                        {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    <span className="text-[9.5px] font-mono text-[--text-muted] block">
                      Best for historical syncs and periodic batch uploads over HTTPS.
                    </span>
                  </div>

                  {/* MQTT Broker Host */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary] block">
                      MQTT Broker (Streaming)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="mqtts://broker.clara.ai:8883"
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText('mqtts://broker.clara.ai:8883', setCopiedMqttHost, 'MQTT Broker Host copied')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                      >
                        {copiedMqttHost ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    <span className="text-[9.5px] font-mono text-[--text-muted] block">
                      Low-latency pub/sub connection for edge devices (e.g. Node-RED, Ignition).
                    </span>
                  </div>

                  {/* MQTT Topic Structure */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-[--text-secondary] block">
                      MQTT Topic Structure
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={`telemetry/${baseFacility.externalId}/+/data`}
                        readOnly
                        className="flex-1 px-3 py-2 text-xs font-mono bg-[--bg-card]/30 border border-[--border-default] rounded text-[--text-secondary] focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyText(`telemetry/${baseFacility.externalId}/+/data`, setCopiedMqttTopic, 'MQTT Topic template copied')}
                        className="flex items-center justify-center p-2 border border-[--border-default] bg-[--bg-card] rounded hover:border-[--border-strong] transition-all cursor-pointer min-w-[36px]"
                      >
                        {copiedMqttTopic ? <Check className="w-3.5 h-3.5 text-[--accent-primary]" /> : <Copy className="w-3.5 h-3.5 text-[--text-secondary]" />}
                      </button>
                    </div>
                    <span className="text-[9.5px] font-mono text-[--text-muted] block">
                      Publish telemetry using the standard asset ID wildcard pattern.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Outbound Webhooks */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-[--accent-primary]" />
                    <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                      Outbound Webhooks
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setShowAddWebhook(!showAddWebhook)}
                    className="flex items-center gap-1 px-3 py-1 rounded border text-[10px] font-mono font-medium hover:border-[--border-strong] transition-colors cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Webhook</span>
                  </button>
                </div>

                {/* Add Webhook Inline Form */}
                {showAddWebhook && (
                  <form onSubmit={handleAddWebhookSubmit} className="p-4 rounded bg-[--bg-card]/30 border border-[--border-subtle] space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[--text-primary]">New Webhook Integration</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-mono uppercase tracking-wider text-[--text-secondary]">Name</label>
                        <input
                          type="text"
                          required
                          value={whName}
                          onChange={(e) => setWhName(e.target.value)}
                          placeholder="e.g. Teams Alert Bridge"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9.5px] font-mono uppercase tracking-wider text-[--text-secondary]">Endpoint URL</label>
                        <input
                          type="url"
                          required
                          value={whUrl}
                          onChange={(e) => setWhUrl(e.target.value)}
                          placeholder="https://api.company.com/webhook"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[9.5px] font-mono uppercase tracking-wider text-[--text-secondary]">Event Triggers</label>
                      <div className="flex flex-wrap gap-4 text-xs font-mono">
                        {['alert.critical', 'alert.warning', 'alert.resolved'].map((ev) => (
                          <label key={ev} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={whEvents.includes(ev)}
                              onChange={() => handleToggleWebhookEvent(ev)}
                              className="sr-only"
                            />
                            <div className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all",
                              whEvents.includes(ev) ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                            )}>
                              {whEvents.includes(ev) && <Check className="w-2.5 h-2.5 text-[--accent-primary] stroke-[3]" />}
                            </div>
                            <span className="text-xs text-[--text-secondary]">{ev}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddWebhook(false)}
                        className="px-3 py-1 rounded border text-[10px] font-mono transition-colors hover:border-[--border-strong] cursor-pointer bg-transparent border-[--border-default] text-[--text-secondary]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 transition-all font-mono text-[10px] font-bold cursor-pointer"
                      >
                        Save Webhook
                      </button>
                    </div>
                  </form>
                )}

                {/* Webhooks List Table */}
                <div className="border border-[--border-subtle] rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[--bg-card]/30 border-b border-[--border-subtle] font-mono text-[9px] uppercase tracking-wider text-[--text-secondary]">
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Endpoint URL</th>
                        <th className="px-4 py-3 font-semibold">Events</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--border-subtle] font-mono text-xs text-[--text-primary]">
                      {webhooks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[--text-muted] text-xs">
                            No outbound webhooks configured.
                          </td>
                        </tr>
                      ) : (
                        webhooks.map((wh) => (
                          <tr key={wh.id} className="hover:bg-[--bg-card]/10 transition-colors">
                            <td className="px-4 py-3.5 font-bold">{wh.name}</td>
                            <td className="px-4 py-3.5 text-[--text-secondary] text-[11px] truncate max-w-[200px]" title={wh.url}>
                              {wh.url}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex gap-1.5 flex-wrap">
                                {wh.events.map((e) => (
                                  <span key={e} className="px-1.5 py-0.5 rounded border text-[9px] font-bold bg-[--bg-card] border-[--border-subtle] text-[--text-secondary]">
                                    {e}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5 text-green-400 font-bold text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <span>{wh.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWebhook(wh.id)}
                                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Delete webhook"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
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
              </div>

              {/* Card 4: Live Ingestion Logs */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[--accent-primary]" />
                    <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                      Live Ingestion Logs
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        streaming && isProcessing ? "bg-green-400 animate-pulse" : "bg-zinc-500"
                      )} />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[--text-secondary]">
                        {streaming && isProcessing ? 'Streaming' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex items-center border border-[--border-subtle] rounded bg-[--bg-card] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isProcessing) {
                            showToast('Resume telemetry processing first')
                            return
                          }
                          setStreaming(!streaming)
                        }}
                        className="p-1.5 hover:bg-[--bg-hover] text-[--text-secondary] hover:text-[--text-primary] border-r border-[--border-subtle] cursor-pointer"
                        title={streaming ? "Pause log stream" : "Play log stream"}
                      >
                        {streaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-green-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogExpanded(!isLogExpanded)}
                        className="p-1.5 hover:bg-[--bg-hover] text-[--text-secondary] hover:text-[--text-primary] cursor-pointer"
                        title={isLogExpanded ? "Contract view" : "Expand view"}
                      >
                        <Maximize2 className={cn("w-3 h-3", isLogExpanded && "rotate-180")} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Log Terminal Area */}
                <div
                  ref={terminalRef}
                  className={cn(
                    "w-full rounded bg-black border border-zinc-900 p-4 font-mono text-[11px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 transition-all duration-300",
                    isLogExpanded ? "h-[500px]" : "h-[250px]"
                  )}
                  style={{ direction: 'ltr', textAlign: 'left' }}
                >
                  <div className="space-y-4">
                    {logs.map((log, lIdx) => (
                      <div key={lIdx} className="space-y-1">
                        <div className="flex items-center gap-2 select-text font-bold">
                          <span className="text-zinc-500">{log.timestamp}</span>
                          <span className={cn(
                            "px-1 rounded text-[9px]",
                            log.method === 'POST' ? "bg-blue-900/40 text-blue-300 border border-blue-800/45" : "bg-purple-900/40 text-purple-300 border border-purple-800/45"
                          )}>
                            {log.method}
                          </span>
                          <span className="text-zinc-300 truncate max-w-[300px] sm:max-w-none">{log.path}</span>
                          <span className="text-green-400 ml-auto text-[10px]">{log.status}</span>
                        </div>
                        <div className="border-l border-zinc-800 pl-2 ml-1 text-zinc-400 select-all selection:bg-zinc-800 selection:text-white">
                          {formatJSONLog(log.payload)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ALERT ROUTING */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Card 1: Notification Channels */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="border-b border-[--border-subtle] pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Notification Channels
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Critical Alerts Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--border-subtle]/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Critical Alerts</h4>
                      <p className="text-[10px] text-[--text-secondary] font-sans">
                        Predicted failures &lt; 48 hours or severe operational anomalies.
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={critEmail}
                          onChange={() => setCritEmail(!critEmail)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          critEmail ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {critEmail && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Email</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={critPush}
                          onChange={() => setCritPush(!critPush)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          critPush ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {critPush && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Push</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={critSMS}
                          onChange={() => setCritSMS(!critSMS)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          critSMS ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {critSMS && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">SMS</span>
                      </label>
                    </div>
                  </div>

                  {/* Warning Alerts Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[--border-subtle]/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Warning Alerts</h4>
                      <p className="text-[10px] text-[--text-secondary] font-sans">
                        Efficiency degradation, missed KPIs, and maintenance recommendations.
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={warnEmail}
                          onChange={() => setWarnEmail(!warnEmail)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          warnEmail ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {warnEmail && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Email</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={warnPush}
                          onChange={() => setWarnPush(!warnPush)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          warnPush ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {warnPush && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Push</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={warnSMS}
                          onChange={() => setWarnSMS(!warnSMS)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          warnSMS ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {warnSMS && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">SMS</span>
                      </label>
                    </div>
                  </div>

                  {/* Advisory Alerts Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Advisory Alerts</h4>
                      <p className="text-[10px] text-[--text-secondary] font-sans">
                        Routine updates, report generations, and system notifications.
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={advEmail}
                          onChange={() => setAdvEmail(!advEmail)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          advEmail ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {advEmail && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Email</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={advPush}
                          onChange={() => setAdvPush(!advPush)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          advPush ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {advPush && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">Push</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={advSMS}
                          onChange={() => setAdvSMS(!advSMS)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          advSMS ? "bg-[--accent-primary]/10 border-[--accent-primary]" : "border-[--border-default] bg-[--bg-card]"
                        )}>
                          {advSMS && <Check className="w-3 h-3 text-[--accent-primary] stroke-[3]" />}
                        </div>
                        <span className="text-xs text-[--text-primary] font-medium font-sans">SMS</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Escalation Policies */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="border-b border-[--border-subtle] pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Escalation Policies
                  </h3>
                </div>

                <div className="divide-y divide-[--border-subtle] space-y-5">
                  {/* Default Assignee Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Default Assignee</h4>
                      <p className="text-[10px] font-sans text-[--text-secondary]">
                        Automatically assign unacknowledged alerts to this user/group.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-[220px]" ref={assigneeRef}>
                      <button
                        type="button"
                        onClick={() => setAssigneeOpen(!assigneeOpen)}
                        className="flex justify-between items-center w-full px-3 py-2 text-xs font-sans bg-[--bg-card] border border-[--border-default] rounded-[6px] text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors cursor-pointer text-left"
                      >
                        <span>{defaultAssignee}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                      </button>

                      {assigneeOpen && (
                        <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                          {assignees.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setDefaultAssignee(name)
                                setAssigneeOpen(false)
                              }}
                              className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                            >
                              <span>{name}</span>
                              {defaultAssignee === name && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Escalation Timeout Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Escalation Timeout</h4>
                      <p className="text-[10px] font-sans text-[--text-secondary]">
                        Time before an unacknowledged Critical Alert is escalated.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-[220px]" ref={timeoutRef}>
                      <button
                        type="button"
                        onClick={() => setTimeoutOpen(!timeoutOpen)}
                        className="flex justify-between items-center w-full px-3 py-2 text-xs font-sans bg-[--bg-card] border border-[--border-default] rounded-[6px] text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors cursor-pointer text-left"
                      >
                        <span>{escalationTimeout}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                      </button>

                      {timeoutOpen && (
                        <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                          {timeouts.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                setEscalationTimeout(t)
                                setTimeoutOpen(false)
                              }}
                              className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                            >
                              <span>{t}</span>
                              {escalationTimeout === t && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Escalate To Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
                    <div className="space-y-1">
                      <h4 className="text-xs font-sans font-bold text-[--text-primary]">Escalate To</h4>
                      <p className="text-[10px] font-sans text-[--text-secondary]">
                        Who to notify when the escalation timeout is reached.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-[220px]" ref={escalateToRef}>
                      <button
                        type="button"
                        onClick={() => setEscalateToOpen(!escalateToOpen)}
                        className="flex justify-between items-center w-full px-3 py-2 text-xs font-sans bg-[--bg-card] border border-[--border-default] rounded-[6px] text-[--text-primary] focus:outline-none focus:border-[--accent-primary] transition-colors cursor-pointer text-left"
                      >
                        <span>{escalateTo}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                      </button>

                      {escalateToOpen && (
                        <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                          {escalateToOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setEscalateTo(opt)
                                setEscalateToOpen(false)
                              }}
                              className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                            >
                              <span>{opt}</span>
                              {escalateTo === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Webhooks & Integrations */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3.5">
                  <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                    Webhooks & Integrations
                  </h3>
                  
                  <button
                    onClick={() => showToast('Redirecting to integration marketplace...')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-sans font-medium hover:border-[--border-strong] transition-colors cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Integration</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded bg-[--bg-card]/30 border border-[--border-subtle]"
                    >
                      <div className="flex items-center gap-3">
                        {integration.type === 'slack' ? (
                          <Slack className="w-5 h-5 text-purple-400 shrink-0" />
                        ) : (
                          <Layers className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-sans text-[--text-primary]">
                              {integration.name} {integration.channel && `(${integration.channel})`}
                            </span>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded border text-[9px] font-sans font-bold uppercase",
                              integration.status === 'Active'
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                            )}>
                              {integration.status}
                            </span>
                          </div>
                          <div className="text-[10px] font-sans text-[--text-secondary]">
                            {integration.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs font-sans font-medium">
                        {integration.type === 'slack' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => showToast('Configure Slack settings...')}
                              className="text-[--text-secondary] hover:text-[--text-primary] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIntegrations(integrations.filter(i => i.id !== integration.id));
                                showToast('Slack integration removed');
                              }}
                              className="text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIntegrations(integrations.map(i => i.type === 'pagerduty' ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i));
                              showToast(integration.status === 'Active' ? 'PagerDuty integration deactivated' : 'PagerDuty integration activated');
                            }}
                            className="text-[--text-secondary] hover:text-[--text-primary] cursor-pointer"
                          >
                            {integration.status === 'Active' ? 'Deactivate' : 'Configure'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TEAM ACCESS */}
          {/* ========================================================================= */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Card: Team Access */}
              <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[--border-subtle] pb-4">
                  <div>
                    <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                      Facility Access Control
                    </h3>
                    <p className="text-xs text-[--text-secondary] mt-1 font-sans">
                      Manage who can view and edit data for {baseFacility.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Member</span>
                  </button>
                </div>

                {/* Team List */}
                <div className="border border-[--border-subtle] rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[--bg-card]/30 border-b border-[--border-subtle] font-sans text-[9px] uppercase tracking-wider text-[--text-secondary]">
                        <th className="px-4 py-3 font-semibold text-left">USER</th>
                        <th className="px-4 py-3 font-semibold text-left">ROLE</th>
                        <th className="px-4 py-3 font-semibold text-left">STATUS</th>
                        <th className="px-4 py-3 font-semibold text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--border-subtle] font-sans text-xs text-[--text-primary]">
                      {team.map((user) => (
                        <tr key={user.id} className="hover:bg-[--bg-card]/10 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-[6px] object-cover border border-zinc-800"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-[6px] bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center font-sans text-xs font-bold text-zinc-300">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <div className="flex flex-col font-sans">
                                <span className="text-xs font-semibold text-[--text-primary]">{user.name}</span>
                                <span className="text-[10px] text-[--text-secondary] mt-0.5">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {user.isLocked ? (
                              <span className="font-sans text-xs text-[--text-secondary]">
                                {user.role}
                              </span>
                            ) : (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveRoleDropdown(activeRoleDropdown === user.id ? null : user.id);
                                  }}
                                  className="flex justify-between items-center gap-2 px-3 py-1.5 text-xs bg-[--bg-card] border border-[--border-default] rounded-[6px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-[150px] text-left"
                                >
                                  <span className="truncate">{user.role}</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                                </button>
                                {activeRoleDropdown === user.id && (
                                  <div className="absolute left-0 mt-1 z-30 w-[150px] rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                                    {(['Facility Manager', 'Viewer'] as const).map((r) => (
                                      <button
                                        key={r}
                                        type="button"
                                        onClick={() => {
                                          setTeam(team.map(m => m.id === user.id ? { ...m, role: r } : m));
                                          setActiveRoleDropdown(null);
                                          showToast(`Updated ${user.name}'s role to ${r}`);
                                        }}
                                        className="flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                                      >
                                        <span>{r}</span>
                                        {user.role === r && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded border text-[10px] font-sans font-semibold",
                              user.status === 'Active'
                                ? "border-green-500/30 text-green-400 bg-transparent"
                                : "border-yellow-500/30 text-yellow-400 bg-transparent"
                            )}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-sans text-xs text-[--text-muted]">
                            {user.isLocked ? (
                              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Locked</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="Remove user access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invite External Contractors */}
                <div className="rounded-[10px] border border-dashed border-zinc-800 bg-[--bg-card]/10 p-8 text-center mt-6">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h4 className="font-sans text-sm font-semibold text-[--text-primary] mb-1.5">
                    Invite External Contractors
                  </h4>
                  <p className="text-xs text-[--text-secondary] font-sans max-w-md mx-auto mb-5 leading-relaxed">
                    You can securely share temporary access to this facility with external contractors or auditors without adding them to your main organization.
                  </p>
                  <button
                    type="button"
                    onClick={() => showToast('Temporary invitation link generated')}
                    className="px-4 py-1.5 rounded-[6px] border border-zinc-700 bg-zinc-950 text-xs font-sans font-semibold text-[--text-primary] hover:border-zinc-500 hover:bg-zinc-900 transition-all cursor-pointer"
                  >
                    Create Temporary Link
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Rotation Confirmation Modal */}
      {showRotateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-[--status-advisory]">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-mono text-sm font-bold text-[--text-primary] tracking-wide">
                  Rotate API Key?
                </h3>
                <p className="text-xs font-mono text-[--text-secondary] mt-1.5 leading-normal">
                  This will immediately invalidate the current edge API key (`{apiKey.substring(0, 10)}...`).
                  Any gateway devices currently using it will fail to authenticate until updated with the new key.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRotateModal(false)}
                disabled={isRotating}
                className="px-3.5 py-1.5 rounded border text-xs font-mono hover:border-[--border-strong] cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRotateKey}
                disabled={isRotating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[--status-advisory] text-[#0A0D14] font-mono text-xs font-bold hover:bg-[--status-advisory]/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRotating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rotating...</span>
                  </>
                ) : (
                  <span>Rotate Key</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Telemetry Confirmation Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-red-400">
              <Info className="w-6 h-6 shrink-0 mt-0.5 text-red-400" />
              <div>
                <h3 className="font-mono text-sm font-bold text-[--text-primary] tracking-wide">
                  {isProcessing ? 'Pause Telemetry Stream?' : 'Resume Telemetry Stream?'}
                </h3>
                <p className="text-xs font-mono text-[--text-secondary] mt-1.5 leading-normal">
                  {isProcessing
                    ? 'Incoming metrics from sensors will be discarded. The ML models will stop analyzing health degradations and PUE parameters.'
                    : 'The telemetry stream connection will be re-established. Real-time sensor metrics and model evaluations will resume immediately.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                disabled={isPausingTask}
                className="px-3.5 py-1.5 rounded border text-xs font-mono hover:border-[--border-strong] cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseTelemetry}
                disabled={isPausingTask}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPausingTask ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{isProcessing ? 'Pause Stream' : 'Resume Stream'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[10px] border border-red-500/30 bg-[--bg-surface] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-mono text-sm font-bold text-[--text-primary] tracking-wide">
                  Permanently Delete Facility?
                </h3>
                <p className="text-xs font-mono text-[--text-secondary] mt-1.5 leading-normal">
                  Are you absolutely sure you want to delete <span className="text-[--text-primary] font-bold font-mono">{baseFacility.name}</span>?
                  This action is irreversible. All telemetry logs, assets, alerts, reports, and historic health data will be deleted immediately.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded border text-xs font-mono hover:border-[--border-strong] cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFacility}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="border-b border-[--border-subtle] pb-3">
              <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                Invite Member
              </h3>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] uppercase tracking-wider text-[--text-secondary]">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary]"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] uppercase tracking-wider text-[--text-secondary]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary]"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] uppercase tracking-wider text-[--text-secondary]">
                  Role
                </label>
                <div className="relative" ref={inviteRoleRef}>
                  <button
                    type="button"
                    onClick={() => setInviteRoleOpen(!inviteRoleOpen)}
                    className="flex justify-between items-center w-full px-3 py-2 text-xs bg-[--bg-card] border border-[--border-default] rounded text-[--text-primary] focus:outline-none focus:border-[--accent-primary] cursor-pointer"
                  >
                    <span>{inviteRole}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                  </button>

                  {inviteRoleOpen && (
                    <div className="absolute left-0 right-0 mt-1 z-20 rounded border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                      {(['Facility Manager', 'Viewer'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setInviteRole(role)
                            setInviteRoleOpen(false)
                          }}
                          className="flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer"
                        >
                          <span>{role}</span>
                          {inviteRole === role && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[--border-subtle]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  disabled={isInviting}
                  className="px-3.5 py-1.5 rounded border text-xs font-sans hover:border-[--border-strong] cursor-pointer bg-[--bg-card] border-[--border-default] text-[--text-primary] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[--accent-primary] text-[#0A0D14] font-sans text-xs font-bold hover:bg-[--accent-primary]/90 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Inviting...</span>
                    </>
                  ) : (
                    <span>Invite Member</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
