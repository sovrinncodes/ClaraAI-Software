'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Building,
  Shield,
  FileText,
  Key,
  Webhook,
  Database,
  BarChart3,
  UserPlus,
  Trash2,
  Copy,
  Check,
  X,
  Plus,
  ChevronDown,
  ExternalLink,
  Users,
  Bell,
  Lock,
  Mail,
  MessageSquare,
  AlertTriangle,
  MoreVertical,
  CheckCircle,
  Eye,
  EyeOff,
  Link2,
  Search,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// TypeScript definitions
interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Engineer' | 'Viewer'
  status: 'Active' | 'Pending'
  avatarUrl?: string
  isLocked?: boolean
  facilitiesAccess: string
  lastActive: string
}

interface ApiKey {
  id: string
  name: string
  secret: string
  fullSecret: string
  permissions: 'Full Access' | 'Read Only' | 'Write Telemetry'
  lastUsed: string
  created: string
  env: 'LIVE' | 'TEST'
}

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  status: 'ACTIVE' | 'FAILING'
  lastDelivery: string
}

export default function SettingsPage() {
  // Tab control state
  const [activeTab, setActiveTab] = useState<'general' | 'team' | 'api-keys' | 'notifications'>('general')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'general' || tabParam === 'team' || tabParam === 'api-keys' || tabParam === 'notifications') {
        setActiveTab(tabParam)
      }
    }
  }, [])

  const handleTabChange = (tab: 'general' | 'team' | 'api-keys' | 'notifications') => {
    setActiveTab(tab)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.set('tab', tab)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.pushState(null, '', newUrl)
    }
  }

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success')
  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
  }

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Copied states
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)
  const [copiedTextMap, setCopiedTextMap] = useState<Record<string, boolean>>({})

  const handleCopyText = (text: string, identifier: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTextMap((prev) => ({ ...prev, [identifier]: true }))
    triggerToast(`${label} copied to clipboard!`)
    setTimeout(() => {
      setCopiedTextMap((prev) => ({ ...prev, [identifier]: false }))
    }, 2000)
  }

  // ----------------------------------------------------
  // GENERAL TAB STATES & HANDLERS
  // ----------------------------------------------------
  const [orgName, setOrgName] = useState('Sovrinn')
  
  // Custom dropdown states
  const [industry, setIndustry] = useState('Data Center')
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const industryOptions = ['Data Center', 'Commercial Real Estate', 'Manufacturing', 'Healthcare', 'Education']
  
  const [timezone, setTimezone] = useState('UTC+02:00 (Johannesburg)')
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)
  const timezoneOptions = [
    'UTC+02:00 (Johannesburg)',
    'UTC+00:00 (London)',
    'UTC+01:00 (Paris)',
    'UTC-05:00 (New York)',
    'UTC-08:00 (Los Angeles)'
  ]

  const [dataRetention, setDataRetention] = useState('1 Year (Standard)')
  const [showRetentionDropdown, setShowRetentionDropdown] = useState(false)
  const retentionOptions = ['1 Year (Standard)', '2 Years', '3 Years', '5 Years', 'Indefinite']

  const [esgStandard, setEsgStandard] = useState('GRI Baseline')
  const [showEsgDropdown, setShowEsgDropdown] = useState(false)
  const esgOptions = ['GRI Baseline', 'GHG Protocol', 'SASB Standards', 'TCFD Recommendations']

  // Security Toggles
  const [require2FA, setRequire2FA] = useState(true)
  
  // SAML Configuration Modal State
  const [showSAMLModal, setShowSAMLModal] = useState(false)
  const [samlEntityId, setSamlEntityId] = useState('https://clara-ai.com/saml/tnt_8x992ncA')
  const [samlSsoUrl, setSamlSsoUrl] = useState('https://identity.cpt.local/adfs/ls')
  const [samlCert, setSamlCert] = useState('MIIC8DCCAdigAwIBAgIQ...')

  // Delete Tenant Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  const handleSaveGeneral = () => {
    triggerToast('General settings saved successfully!')
  }

  const handleSaveCompliance = () => {
    triggerToast('Data & compliance settings updated!')
  }

  const handleToggle2FA = () => {
    const nextState = !require2FA
    setRequire2FA(nextState)
    triggerToast(nextState ? 'Two-Factor Authentication enforced.' : 'Two-Factor Authentication disabled.', nextState ? 'success' : 'warning')
  }

  const handleSaveSAML = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSAMLModal(false)
    triggerToast('SAML Configuration saved successfully!')
  }

  const handleDeleteTenant = () => {
    if (deleteConfirmInput === 'Sovrinn') {
      setShowDeleteModal(false)
      triggerToast('Tenant deletion initiated! Redirecting...', 'warning')
      setDeleteConfirmInput('')
    }
  }

  // ----------------------------------------------------
  // TEAM MEMBERS TAB STATES & HANDLERS
  // ----------------------------------------------------
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Connor', email: 'sarah.c@completeproperty.co.za', role: 'Admin', status: 'Active', avatarUrl: '/avatar_thandiwe.png', facilitiesAccess: 'All Facilities', lastActive: 'Just now', isLocked: false },
    { id: '2', name: 'David Mbeki', email: 'david.m@completeproperty.co.za', role: 'Manager', status: 'Active', facilitiesAccess: 'JHB Data Centre', lastActive: '2h ago', isLocked: false },
    { id: '3', name: 'Thabo Ndlovu', email: 'thabo.n@completeproperty.co.za', role: 'Engineer', status: 'Active', avatarUrl: '/avatar_sipho.png', facilitiesAccess: '2 Facilities', lastActive: '1d ago', isLocked: false },
    { id: '4', name: 'Lisa Van Der Merwe', email: 'lisa.v@completeproperty.co.za', role: 'Viewer', status: 'Pending', facilitiesAccess: 'All Facilities', lastActive: 'Invited', isLocked: false }
  ])
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(null)
  
  // Search & Filter state for Team tab
  const [teamSearch, setTeamSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Manager' | 'Engineer' | 'Viewer'>('All')
  const [showRoleFilterDropdown, setShowRoleFilterDropdown] = useState(false)

  // Invite member state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Manager' | 'Engineer' | 'Viewer'>('Viewer')
  const [showInviteRoleDropdown, setShowInviteRoleDropdown] = useState(false)

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName || !inviteEmail) return
    
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      facilitiesAccess: 'All Facilities',
      lastActive: 'Invited'
    }

    setTeamMembers([...teamMembers, newMember])
    setShowInviteModal(false)
    setInviteName('')
    setInviteEmail('')
    setInviteRole('Viewer')
    triggerToast(`Invitation email sent to ${inviteEmail}`)
  }

  const handleRemoveMember = (id: string, name: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id))
    triggerToast(`Removed ${name}'s access.`)
  }

  const handleChangeRole = (memberId: string, role: 'Admin' | 'Manager' | 'Engineer' | 'Viewer') => {
    setTeamMembers(teamMembers.map(m => m.id === memberId ? { ...m, role } : m))
    setActiveRoleDropdown(null)
    const memberName = teamMembers.find(m => m.id === memberId)?.name
    triggerToast(`Updated ${memberName}'s role to ${role}`)
  }

  // ----------------------------------------------------
  // API KEYS TAB STATES & HANDLERS
  // ----------------------------------------------------
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 'key_1', name: 'Production SCADA Sync', secret: 'clara_live_********************8f9a', fullSecret: 'clara_live_scada_prod_903120381092380128f9a', permissions: 'Write Telemetry', lastUsed: '2 mins ago', created: 'Oct 15, 2024', env: 'LIVE' },
    { id: 'key_2', name: 'PowerBI Dashboard', secret: 'clara_live_********************3b2c', fullSecret: 'clara_live_pbi_dash_3904810923812038123b2c', permissions: 'Read Only', lastUsed: '1 hour ago', created: 'Nov 02, 2024', env: 'LIVE' },
    { id: 'key_3', name: 'Legacy HVAC Gateway', secret: 'clara_test_********************9d1e', fullSecret: 'clara_test_hvac_legacy_098231023801239d1e', permissions: 'Full Access', lastUsed: 'Never', created: 'Jan 10, 2025', env: 'TEST' }
  ])

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    { id: 'wh_1', url: 'https://api.pagerduty.com/integrations/v1/events/clara', events: ['alert.critical', 'alert.warning'], status: 'ACTIVE', lastDelivery: '4 hours ago' },
    { id: 'wh_2', url: 'https://internal.cpt.local/webhook', events: ['workorder.created', 'workorder.updated'], status: 'FAILING', lastDelivery: '2 days ago' }
  ])

  // Generate Key Modal State
  const [showGenKeyModal, setShowGenKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<'LIVE' | 'TEST'>('LIVE')
  const [newKeyPerms, setNewKeyPerms] = useState<'Full Access' | 'Read Only' | 'Write Telemetry'>('Write Telemetry')
  const [showNewKeyEnvDropdown, setShowNewKeyEnvDropdown] = useState(false)
  const [showNewKeyPermsDropdown, setShowNewKeyPermsDropdown] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  // Webhook Modal State
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])
  
  const webhookEventOptions = ['alert.critical', 'alert.warning', 'workorder.created', 'workorder.updated']

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName) return

    const randomHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const prefix = newKeyEnv === 'LIVE' ? 'clara_live_' : 'clara_test_'
    const generatedRaw = `${prefix}${randomHex}`
    const maskedSecret = `${prefix}********************${generatedRaw.slice(-4)}`
    
    setGeneratedKey(generatedRaw)

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      secret: maskedSecret,
      fullSecret: generatedRaw,
      permissions: newKeyPerms,
      lastUsed: 'Never',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      env: newKeyEnv
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName('')
    triggerToast(`API Key "${newKeyName}" generated successfully.`)
  }

  const handleDeleteKey = (id: string, name: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
    triggerToast(`API Key "${name}" revoked.`)
  }

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWebhookUrl || newWebhookEvents.length === 0) return

    const newWh: WebhookEndpoint = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl,
      events: newWebhookEvents,
      status: 'ACTIVE',
      lastDelivery: 'Never'
    }

    setWebhooks([...webhooks, newWh])
    setShowWebhookModal(false)
    setNewWebhookUrl('')
    setNewWebhookEvents([])
    triggerToast(`Webhook endpoint registered.`)
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id))
    triggerToast(`Webhook endpoint deleted.`)
  }

  const toggleWebhookEventSelection = (event: string) => {
    if (newWebhookEvents.includes(event)) {
      setNewWebhookEvents(newWebhookEvents.filter(e => e !== event))
    } else {
      setNewWebhookEvents([...newWebhookEvents, event])
    }
  }

  // ----------------------------------------------------
  // NOTIFICATIONS TAB STATES & HANDLERS
  // ----------------------------------------------------
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [pushNotifs, setPushNotifs] = useState(true)

  const [notifCritical, setNotifCritical] = useState(true) // Enforced
  const [notifWarning, setNotifWarning] = useState(true)
  const [notifEsg, setNotifEsg] = useState(false)

  const handleSaveNotifications = () => {
    triggerToast('Notification preferences updated!')
  }

  // Close dropdowns on outside click
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowIndustryDropdown(false)
        setShowTimezoneDropdown(false)
        setShowRetentionDropdown(false)
        setShowEsgDropdown(false)
        setActiveRoleDropdown(null)
        setShowInviteRoleDropdown(false)
        setShowNewKeyEnvDropdown(false)
        setShowNewKeyPermsDropdown(false)
        setShowRoleFilterDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="flex flex-col gap-6 h-full relative" ref={dropdownRef}>
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className="fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-[8px] border shadow-2xl font-mono text-xs animate-in fade-in slide-in-from-top-4 duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: toastType === 'warning' ? 'var(--color-negative)' : '#00D4AA',
            color: 'var(--text-primary)'
          }}
        >
          {toastType === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-[--color-negative]" />
          ) : (
            <Check className="w-4 h-4 text-[#00D4AA]" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[--text-secondary]">
        <span className="hover:text-[--text-primary] transition-colors cursor-pointer">Settings</span>
        <span>/</span>
        <span className="text-[--text-muted] capitalize">
          {activeTab === 'api-keys' ? 'API Keys' : activeTab === 'team' ? 'Team Members' : activeTab}
        </span>
      </div>

      {/* Main Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-light tracking-wide text-[--text-primary] mb-1">
            Settings
          </h1>
          <p className="text-xs text-[--text-secondary] font-sans">
            Manage your tenant preferences, team access, and API integrations.
          </p>
        </div>
        
        {activeTab === 'team' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-sans text-xs font-bold px-4 py-2 rounded-[6px] cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Tabs Selector row */}
      <div className="flex border-b border-[--border-subtle] gap-6 text-sm font-sans relative">
        <button
          onClick={() => handleTabChange('general')}
          className={cn(
            'pb-3.5 px-1 font-semibold transition-all relative cursor-pointer outline-none',
            activeTab === 'general' ? 'text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
          )}
        >
          General
          {activeTab === 'general' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[--accent-primary]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('team')}
          className={cn(
            'pb-3.5 px-1 font-semibold transition-all relative cursor-pointer outline-none',
            activeTab === 'team' ? 'text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
          )}
        >
          Team Members
          {activeTab === 'team' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[--accent-primary]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('api-keys')}
          className={cn(
            'pb-3.5 px-1 font-semibold transition-all relative cursor-pointer outline-none',
            activeTab === 'api-keys' ? 'text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
          )}
        >
          API Keys
          {activeTab === 'api-keys' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[--accent-primary]" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('notifications')}
          className={cn(
            'pb-3.5 px-1 font-semibold transition-all relative cursor-pointer outline-none',
            activeTab === 'notifications' ? 'text-[--text-primary]' : 'text-[--text-muted] hover:text-[--text-secondary]'
          )}
        >
          Notifications
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[--accent-primary]" />
          )}
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* GENERAL TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-in fade-in duration-200">
          {/* Left panel: Inputs & Forms */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Card: Organization Profile */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[--border-subtle] pb-3">
                <Building className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  Organization Profile
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-[10px] bg-[--bg-card] border border-[--border-strong] flex items-center justify-center font-mono text-xl font-bold text-[--text-secondary]">
                  CP
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => triggerToast('Logo upload triggered! Recommended size 256x256.')}
                    className="px-3.5 py-1.5 rounded-[6px] border border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-xs font-sans font-semibold text-[--text-primary] transition-all cursor-pointer"
                  >
                    Upload Logo
                  </button>
                  <p className="text-[10px] text-[--text-muted] font-sans">
                    Recommended size: 256x256px. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-sans text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[#00D4AA] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Industry Select */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                      Industry Vertical
                    </label>
                    <button
                      onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
                      className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                    >
                      <span>{industry}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                    </button>
                    {showIndustryDropdown && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                        {industryOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setIndustry(opt)
                              setShowIndustryDropdown(false)
                            }}
                            className={cn(
                              'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                              industry === opt && 'bg-[--bg-active]'
                            )}
                          >
                            <span>{opt}</span>
                            {industry === opt && <Check className="w-3 h-3 text-[--accent-primary]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timezone Select */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                      Default Timezone
                    </label>
                    <button
                      onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                      className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                    >
                      <span className="truncate">{timezone}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                    </button>
                    {showTimezoneDropdown && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                        {timezoneOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              setTimezone(opt)
                              setShowTimezoneDropdown(false)
                            }}
                            className={cn(
                              'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                              timezone === opt && 'bg-[--bg-active]'
                            )}
                          >
                            <span className="truncate">{opt}</span>
                            {timezone === opt && <Check className="w-3 h-3 text-[--accent-primary]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveGeneral}
                  className="bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Card: Security */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[--border-subtle] pb-3">
                <Shield className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  Security Settings
                </h3>
              </div>

              {/* Requirement: 2FA Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-[8px] bg-[--bg-card] border border-[--border-subtle]">
                <div className="space-y-1">
                  <span className="block font-sans text-xs font-semibold text-[--text-primary]">
                    Require Two-Factor Authentication
                  </span>
                  <span className="block font-sans text-[10px] text-[--text-secondary]">
                    Enforce 2FA for all user accounts in this tenant.
                  </span>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={cn(
                    'w-9 h-5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer outline-none',
                    require2FA ? 'bg-[--accent-primary]' : 'bg-[--bg-elevated] border border-[--border-default]'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      require2FA ? 'translate-x-4 bg-[#0A0D14]' : 'translate-x-0 bg-[--text-muted]'
                    )}
                  />
                </button>
              </div>

              {/* Requirement: SAML SSO */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-[8px] bg-[--bg-card] border border-[--border-subtle]">
                <div className="space-y-1">
                  <span className="block font-sans text-xs font-semibold text-[--text-primary]">
                    SAML Single Sign-On (SSO)
                  </span>
                  <span className="block font-sans text-[10px] text-[--text-secondary]">
                    Configure Single Sign-On via enterprise identity provider (Okta, ADFS, Azure AD).
                  </span>
                </div>
                <button
                  onClick={() => setShowSAMLModal(true)}
                  className="px-3 py-1.5 rounded-[6px] border border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-xs font-sans font-semibold text-[--text-primary] transition-all cursor-pointer"
                >
                  Configure
                </button>
              </div>
            </div>

            {/* Card: Data & Compliance */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[--border-subtle] pb-3">
                <FileText className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  Data & Compliance
                </h3>
              </div>

              <div className="space-y-4">
                {/* Data Retention Select */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    Data Retention Period
                  </label>
                  <button
                    onClick={() => setShowRetentionDropdown(!showRetentionDropdown)}
                    className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                  >
                    <span>{dataRetention}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                  </button>
                  {showRetentionDropdown && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                      {retentionOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setDataRetention(opt)
                            setShowRetentionDropdown(false)
                          }}
                          className={cn(
                            'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                            dataRetention === opt && 'bg-[--bg-active]'
                          )}
                        >
                          <span>{opt}</span>
                          {dataRetention === opt && <Check className="w-3 h-3 text-[--accent-primary]" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[--text-muted] font-sans">
                    Telemetry data older than the retention period will be permanently deleted.
                  </p>
                </div>

                {/* ESG Standard Select */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    ESG Reporting Standard
                  </label>
                  <button
                    onClick={() => setShowEsgDropdown(!showEsgDropdown)}
                    className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                  >
                    <span>{esgStandard}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                  </button>
                  {showEsgDropdown && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                      {esgOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setEsgStandard(opt)
                            setShowEsgDropdown(false)
                          }}
                          className={cn(
                            'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                            esgStandard === opt && 'bg-[--bg-active]'
                          )}
                        >
                          <span>{opt}</span>
                          {esgStandard === opt && <Check className="w-3 h-3 text-[--accent-primary]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveCompliance}
                  className="bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Details & Danger Zone */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Tenant Details */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[--border-subtle] pb-3">
                <Shield className="w-4 h-4 text-[--text-secondary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  Tenant Details
                </h3>
              </div>

              <div className="divide-y divide-[--border-subtle] font-sans text-xs">
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[--text-secondary]">Tenant ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[--text-primary]">tnt_8x992ncA</span>
                    <button
                      onClick={() => handleCopyText('tnt_8x992ncA', 'tenantId', 'Tenant ID')}
                      className="p-1 rounded hover:bg-[--bg-hover] text-[--text-muted] hover:text-[--text-primary] transition-colors"
                      title="Copy Tenant ID"
                    >
                      {copiedTextMap['tenantId'] ? (
                        <Check className="w-3.5 h-3.5 text-[#00D4AA]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[--text-secondary]">Current Plan</span>
                  <span className="font-semibold text-[--text-primary]">Enterprise Trial</span>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[--text-secondary]">Monitored Facilities</span>
                  <span className="text-[--text-primary]">4 / Unlimited</span>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[--text-secondary]">Data Region</span>
                  <span className="font-mono text-[11px] text-[--text-primary]">af-south-1</span>
                </div>

                <div className="flex justify-between items-center py-2.5">
                  <span className="text-[--text-secondary]">Created On</span>
                  <span className="text-[--text-primary]">Oct 12, 2024</span>
                </div>
              </div>
            </div>

            {/* Card: Danger Zone */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[--border-subtle] pb-3">
                <AlertTriangle className="w-4 h-4 text-[--color-negative]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  Danger Zone
                </h3>
              </div>

              <p className="text-xs text-[--text-secondary] leading-relaxed font-sans">
                Permanently delete this tenant and all associated telemetry, users, and configuration data. This action cannot be undone.
              </p>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 bg-[--color-negative] text-white hover:bg-[--color-negative]/90 transition-all font-sans text-xs font-bold rounded-[6px] cursor-pointer text-center"
              >
                Delete Tenant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TEAM MEMBERS TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'team' && (() => {
        const filteredMembers = teamMembers.filter((m) => {
          if (teamSearch.trim() !== '') {
            const q = teamSearch.toLowerCase()
            const matchName = m.name.toLowerCase().includes(q)
            const matchEmail = m.email.toLowerCase().includes(q)
            if (!matchName && !matchEmail) return false
          }
          if (roleFilter !== 'All') {
            if (m.role !== roleFilter) return false
          }
          return true
        })

        return (
          <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4 animate-in fade-in duration-200">
            
            {/* Search and filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[--bg-card]/30 p-3 rounded-[6px] border border-[--border-subtle]">
              {/* Search input */}
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-muted]" />
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-9 pr-4 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[6px] text-xs font-sans text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[#00D4AA] transition-colors"
                />
              </div>

              {/* Role Filter Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleFilterDropdown(!showRoleFilterDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-sans font-medium transition-all border-[--border-default] hover:border-[--border-strong] bg-[var(--bg-elevated)] text-[--text-primary] cursor-pointer"
                >
                  <span>{roleFilter === 'All' ? 'All Roles' : roleFilter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[--text-muted]" />
                </button>
                {showRoleFilterDropdown && (
                  <div className="absolute left-0 mt-1.5 w-[140px] rounded-[6px] border border-[--border-strong] bg-[--bg-elevated] shadow-2xl z-30 font-sans text-xs overflow-hidden">
                    {(['All', 'Admin', 'Manager', 'Engineer', 'Viewer'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setRoleFilter(opt)
                          setShowRoleFilterDropdown(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 hover:bg-[var(--bg-hover)] text-[--text-primary] border-b border-[--border-subtle] last:border-b-0 cursor-pointer flex justify-between items-center',
                          roleFilter === opt && 'bg-[var(--bg-active)]'
                        )}
                      >
                        <span>{opt === 'All' ? 'All Roles' : opt}</span>
                        {roleFilter === opt && <Check className="w-3.5 h-3.5 text-[--accent-primary]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right side member count */}
              <div className="sm:ml-auto font-mono text-[10px] text-[--text-secondary]">
                {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
              </div>
            </div>

            {/* Members Table */}
            <div className="border border-[--border-subtle] rounded-[6px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[--bg-card]/30 border-b border-[--border-subtle] font-sans text-[9px] uppercase tracking-wider text-[--text-secondary]">
                    <th className="px-4 py-3 font-semibold text-left">USER</th>
                    <th className="px-4 py-3 font-semibold text-left">ROLE</th>
                    <th className="px-4 py-3 font-semibold text-left">FACILITIES ACCESS</th>
                    <th className="px-4 py-3 font-semibold text-left">LAST ACTIVE</th>
                    <th className="px-4 py-3 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border-subtle] font-sans text-xs text-[--text-primary]">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((user) => (
                      <tr key={user.id} className="hover:bg-[--bg-card]/10 transition-colors">
                        {/* User Avatar + Email details */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-8 h-8 rounded-[6px] object-cover border border-[--border-default]"
                              />
                            ) : user.role === 'Viewer' ? (
                              <div className="w-8 h-8 rounded-[6px] bg-[--bg-card] border border-[--border-default] flex items-center justify-center text-[--text-muted] shrink-0">
                                <Mail className="w-3.5 h-3.5 text-[--text-muted]" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-[6px] bg-[--bg-card] border border-[--border-default] flex items-center justify-center font-sans text-xs font-bold text-[--text-secondary]">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                            <div className="flex flex-col font-sans">
                              <div className="flex items-center">
                                <span className="text-xs font-semibold text-[--text-primary]">{user.name}</span>
                                {user.name === 'Sarah Connor' && (
                                  <span className="bg-[--bg-active] border border-[--border-strong] text-[--text-muted] font-mono text-[8px] px-1 rounded-[2px] font-semibold ml-1.5">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[--text-secondary] mt-0.5">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* User Permission Role dropdown */}
                        <td className="px-4 py-3.5">
                          {user.name === 'Sarah Connor' ? (
                            <span className="px-2 py-0.5 rounded border text-[10px] font-sans font-semibold bg-[rgba(0,212,170,0.08)] border-[rgba(0,212,170,0.18)] text-[--accent-primary]">
                              Admin
                            </span>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => setActiveRoleDropdown(activeRoleDropdown === user.id ? null : user.id)}
                                className="flex justify-between items-center gap-2 px-3 py-1.5 text-xs bg-[--bg-card] border border-[--border-default] rounded-[6px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-[140px] text-left"
                              >
                                <span className="truncate">{user.role}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                              </button>
                              {activeRoleDropdown === user.id && (
                                <div className="absolute left-0 mt-1 z-30 w-[140px] rounded-[6px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                                  {(['Admin', 'Manager', 'Engineer', 'Viewer'] as const).map((r) => (
                                    <button
                                      key={r}
                                      type="button"
                                      onClick={() => handleChangeRole(user.id, r)}
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

                        {/* Facilities Access Column */}
                        <td className="px-4 py-3.5">
                          {user.facilitiesAccess === '2 Facilities' ? (
                            <span
                              onClick={() => triggerToast('Viewing facilities access rules...')}
                              className="text-xs text-[--accent-primary] font-semibold hover:underline cursor-pointer transition-all"
                            >
                              2 Facilities
                            </span>
                          ) : (
                            <span className="text-xs text-[--text-secondary]">
                              {user.facilitiesAccess}
                            </span>
                          )}
                        </td>

                        {/* Last Active / Invited Column */}
                        <td className="px-4 py-3.5">
                          {user.lastActive === 'Invited' ? (
                            <div className="flex items-center gap-1.5 text-[#F5A623] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
                              <span>Invited</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[--text-secondary]">
                              {user.lastActive}
                            </span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3.5 text-right font-sans text-xs text-[--text-muted]">
                          {user.name === 'Sarah Connor' ? (
                            <span className="text-[10px] uppercase font-bold text-[--text-muted] tracking-wider">Locked</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRemoveMember(user.id, user.name)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Remove Access"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs font-mono text-[--text-muted]">
                        No organization members matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Invite External Contractors banner */}
            <div className="rounded-[10px] border border-dashed border-[--border-default] bg-[--bg-card]/10 p-8 text-center mt-6">
              <div className="w-10 h-10 rounded-full border border-[--border-default] bg-[--bg-card] flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-5 h-5 text-[--text-secondary]" />
              </div>
              <h4 className="font-sans text-sm font-semibold text-[--text-primary] mb-1.5">
                Invite External Contractors
              </h4>
              <p className="text-xs text-[--text-secondary] font-sans max-w-md mx-auto mb-5 leading-relaxed">
                Securely share temporary access to this organization with external contractors, auditors or support technicians without adding them to your billing plan.
              </p>
              <button
                onClick={() => {
                  const tempToken = `https://clara-ai.com/invite/temp_token_f9328a01f827b3`
                  handleCopyText(tempToken, 'tempToken', 'Contractor Link')
                }}
                className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-[--bg-elevated] text-xs font-sans font-semibold text-[--text-primary] hover:border-[--border-strong] hover:bg-[--bg-hover] transition-all cursor-pointer"
              >
                Create Temporary Link
              </button>
            </div>
          </div>
        )
      })()}

      {/* ---------------------------------------------------- */}
      {/* API KEYS TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'api-keys' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start animate-in fade-in duration-200">
          
          {/* Left Column: API Keys & Webhooks */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Card: API Keys Table */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[--border-subtle] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[--accent-primary]" />
                    <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                      API Keys
                    </h3>
                  </div>
                  <p className="text-[11px] text-[--text-secondary] font-sans">
                    Manage API keys used to authenticate programmatic access to your tenant data.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setGeneratedKey(null)
                    setShowGenKeyModal(true)
                  }}
                  className="flex items-center gap-1.5 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate New Key</span>
                </button>
              </div>

              {/* API Keys List */}
              <div className="border border-[--border-subtle] rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[--bg-card]/30 border-b border-[--border-subtle] font-mono text-[9px] uppercase tracking-wider text-[--text-secondary]">
                      <th className="px-4 py-3 font-semibold text-left">NAME & ENVIRONMENT</th>
                      <th className="px-4 py-3 font-semibold text-left">SECRET KEY</th>
                      <th className="px-4 py-3 font-semibold text-left">PERMISSIONS</th>
                      <th className="px-4 py-3 font-semibold text-left">LAST USED</th>
                      <th className="px-4 py-3 font-semibold text-left">CREATED</th>
                      <th className="px-4 py-3 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--border-subtle] font-mono text-xs text-[--text-primary]">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-[--bg-card]/10 transition-colors">
                        <td className="px-4 py-3.5 font-sans">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-[--text-primary]">{key.name}</span>
                            <span className={cn(
                              "text-[8px] font-mono font-bold px-1 py-0.5 rounded border self-start mt-1 tracking-wider",
                              key.env === 'LIVE' 
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-[--bg-card] text-[--text-secondary] border-[--border-default]"
                            )}>
                              {key.env}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 bg-[--bg-card] border border-[--border-default] px-2 py-1 rounded-[4px] max-w-[220px]">
                            <span className="text-[11px] text-[--text-secondary] truncate select-all">{key.secret}</span>
                            <button
                              onClick={() => handleCopyText(key.fullSecret, key.id, 'API Key')}
                              className="p-1 text-[--text-muted] hover:text-[--text-primary] transition-colors"
                            >
                              {copiedTextMap[key.id] ? (
                                <Check className="w-3 h-3 text-[#00D4AA]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-sans text-xs text-[--text-secondary]">
                          {key.permissions}
                        </td>

                        <td className="px-4 py-3.5 text-[--text-secondary] text-xs font-sans">
                          {key.lastUsed}
                        </td>

                        <td className="px-4 py-3.5 text-[--text-secondary] text-xs font-sans">
                          {key.created}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteKey(key.id, key.name)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card: Webhooks Table */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[--border-subtle] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-[--accent-primary]" />
                    <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                      Webhooks
                    </h3>
                  </div>
                  <p className="text-[11px] text-[--text-secondary] font-sans">
                    Receive real-time HTTP POST payloads when critical events occur in your tenant.
                  </p>
                </div>

                <button
                  onClick={() => setShowWebhookModal(true)}
                  className="flex items-center gap-1.5 bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 hover:shadow-[0_0_15px_rgba(0,212,170,0.3)] transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Endpoint</span>
                </button>
              </div>

              {/* Webhooks List */}
              <div className="border border-[--border-subtle] rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[--bg-card]/30 border-b border-[--border-subtle] font-mono text-[9px] uppercase tracking-wider text-[--text-secondary]">
                      <th className="px-4 py-3 font-semibold text-left">ENDPOINT URL</th>
                      <th className="px-4 py-3 font-semibold text-left">SUBSCRIBED EVENTS</th>
                      <th className="px-4 py-3 font-semibold text-left">STATUS</th>
                      <th className="px-4 py-3 font-semibold text-left">LAST DELIVERY</th>
                      <th className="px-4 py-3 font-semibold text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--border-subtle] font-mono text-xs text-[--text-primary]">
                    {webhooks.map((wh) => (
                      <tr key={wh.id} className="hover:bg-[--bg-card]/10 transition-colors">
                        <td className="px-4 py-3.5 truncate max-w-[240px]" title={wh.url}>
                          <span className="font-mono text-xs select-all text-[--text-primary]">{wh.url}</span>
                        </td>
                        
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5 flex-wrap">
                            {wh.events.map((ev) => (
                              <span key={ev} className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[--bg-card] border border-[--border-subtle] text-[--text-secondary]">
                                {ev}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={cn(
                            "px-2 py-0.5 rounded border text-[9px] font-sans font-bold tracking-wider",
                            wh.status === 'ACTIVE'
                              ? "border-green-500/30 text-green-400 bg-transparent"
                              : "border-red-500/30 text-red-400 bg-transparent"
                          )}>
                            {wh.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-[--text-secondary] text-xs font-sans">
                          {wh.lastDelivery}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteWebhook(wh.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Webhook"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 text-[--text-muted] hover:text-[--text-primary] cursor-pointer">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: API Info & Usage */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: API Authentication */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[--border-subtle] pb-3">
                <Database className="w-4 h-4 text-[--text-secondary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  API Authentication
                </h3>
              </div>

              <p className="text-xs text-[--text-secondary] leading-relaxed font-sans">
                Authenticate API requests by including your secret key in the Authorization header.
              </p>

              {/* Curl sample code block */}
              <div className="relative bg-[--bg-base] border border-[--border-strong] rounded-[6px] p-4 font-mono text-[10px] text-[--text-secondary] space-y-2 overflow-x-auto">
                <div className="flex justify-between items-center border-b border-[--border-subtle] pb-1.5 mb-1.5 text-[--text-muted]">
                  <span>cURL Command</span>
                  <button
                    onClick={() => handleCopyText('curl https://api.clara-ai.com/v1/facilities \\\n  -H "Authorization: Bearer clara_live_********************8f9a"', 'curlSample', 'Curl command')}
                    className="p-1 hover:bg-[--bg-hover] rounded transition-colors text-[--text-muted] hover:text-[--text-primary]"
                  >
                    {copiedTextMap['curlSample'] ? (
                      <Check className="w-3 h-3 text-[#00D4AA]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="whitespace-pre">
                  <span className="text-[#00D4AA]">curl</span> https://api.clara-ai.com/v1/facilities \<br />
                  &nbsp;&nbsp;-H <span className="text-[#3B82F6]">"Authorization: Bearer clara_live_..."</span>
                </div>
              </div>

              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  triggerToast('Navigating to full developer documentation...')
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[--accent-primary] hover:text-[--accent-primary]/80 transition-colors cursor-pointer"
              >
                <span>View Full Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card: API Usage */}
            <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-[--border-subtle] pb-3">
                <BarChart3 className="w-4 h-4 text-[--text-secondary]" />
                <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                  API Usage
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="text-[--text-secondary]">Requests this month</span>
                  <span className="text-[--text-primary] font-bold">124,592 <span className="text-[--text-muted] font-normal">/ 500k</span></span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-[--bg-card] border border-[--border-subtle] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[--accent-primary] rounded-full shadow-[0_0_8px_rgba(0,212,170,0.4)]"
                    style={{ width: '24.9%' }}
                  />
                </div>

                <p className="text-[10px] text-[--text-secondary] leading-relaxed font-sans pt-1">
                  Your current plan includes 500,000 API requests per month. Overage is billed at R 0.95 per 1,000 requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* NOTIFICATIONS TAB CONTENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
          
          {/* Card: Communication Preferences */}
          <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[--border-subtle] pb-3">
              <Bell className="w-4 h-4 text-[--accent-primary]" />
              <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                Communication Channels
              </h3>
            </div>

            <div className="space-y-4">
              
              {/* Channel 1: Email */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-[8px] bg-[--bg-card] border border-[--border-subtle]">
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-[--text-secondary] mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="block font-sans text-xs font-semibold text-[--text-primary]">
                      Email Alerts
                    </span>
                    <span className="block font-sans text-[10px] text-[--text-secondary] leading-relaxed">
                      Receive weekly ESG compliance reports, daily equipment health summaries, and system status updates.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={cn(
                    'w-9 h-5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer outline-none shrink-0',
                    emailNotifs ? 'bg-[--accent-primary]' : 'bg-[--bg-elevated] border border-[--border-default]'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      emailNotifs ? 'translate-x-4 bg-[#0A0D14]' : 'translate-x-0 bg-[--text-muted]'
                    )}
                  />
                </button>
              </div>

              {/* Channel 2: SMS */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-[8px] bg-[--bg-card] border border-[--border-subtle]">
                <div className="flex gap-3">
                  <MessageSquare className="w-4 h-4 text-[--text-secondary] mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="block font-sans text-xs font-semibold text-[--text-primary]">
                      SMS Text Messages
                    </span>
                    <span className="block font-sans text-[10px] text-[--text-secondary] leading-relaxed">
                      Receive immediate SMS notifications on your registered phone number when high-severity diagnostic alarms are triggered.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSmsNotifs(!smsNotifs)}
                  className={cn(
                    'w-9 h-5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer outline-none shrink-0',
                    smsNotifs ? 'bg-[--accent-primary]' : 'bg-[--bg-elevated] border border-[--border-default]'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      smsNotifs ? 'translate-x-4 bg-[#0A0D14]' : 'translate-x-0 bg-[--text-muted]'
                    )}
                  />
                </button>
              </div>

              {/* Channel 3: Push */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-[8px] bg-[--bg-card] border border-[--border-subtle]">
                <div className="flex gap-3">
                  <Bell className="w-4 h-4 text-[--text-secondary] mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <span className="block font-sans text-xs font-semibold text-[--text-primary]">
                      In-Browser Push Notifications
                    </span>
                    <span className="block font-sans text-[10px] text-[--text-secondary] leading-relaxed">
                      Receive live notifications inside the web dashboard interface for active work orders and equipment warning anomalies.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPushNotifs(!pushNotifs)}
                  className={cn(
                    'w-9 h-5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer outline-none shrink-0',
                    pushNotifs ? 'bg-[--accent-primary]' : 'bg-[--bg-elevated] border border-[--border-default]'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      pushNotifs ? 'translate-x-4 bg-[#0A0D14]' : 'translate-x-0 bg-[--text-muted]'
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNotifications}
                className="bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer"
              >
                Save Channels
              </button>
            </div>
          </div>

          {/* Card: Alarm Alert Categories */}
          <div className="rounded-[10px] border border-[--border-default] bg-[--bg-surface] p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[--border-subtle] pb-3">
              <AlertTriangle className="w-4 h-4 text-[--accent-primary]" />
              <h3 className="font-sans text-sm font-semibold text-[--text-primary]">
                Alarm Severity Subscriptions
              </h3>
            </div>

            <div className="space-y-3 font-sans text-xs">
              
              {/* Category 1: Critical (Locked) */}
              <div className="flex items-center gap-3 p-3 bg-[--bg-card]/30 border border-[--border-subtle] rounded-[6px]">
                <div className="w-4 h-4 rounded border border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#0A0D14] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[--text-primary]">Critical Severity Alarms</span>
                  <span className="text-[10px] text-[--text-secondary] mt-0.5">Downtime risks, power system failure alarms, critical health scores. (Enforced)</span>
                </div>
              </div>

              {/* Category 2: Warning */}
              <div
                onClick={() => setNotifWarning(!notifWarning)}
                className="flex items-center gap-3 p-3 bg-[--bg-card]/30 border border-[--border-subtle] rounded-[6px] cursor-pointer hover:border-[--border-strong] transition-all"
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                  notifWarning
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#0A0D14]"
                    : "border-[var(--border-strong)]"
                )}>
                  {notifWarning && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[--text-primary]">Warning & Advisory Alarms</span>
                  <span className="text-[10px] text-[--text-secondary] mt-0.5">Pre-failure degradation warnings, maintenance schedules, efficiency degradation logs.</span>
                </div>
              </div>

              {/* Category 3: ESG compliance */}
              <div
                onClick={() => setNotifEsg(!notifEsg)}
                className="flex items-center gap-3 p-3 bg-[--bg-card]/30 border border-[--border-subtle] rounded-[6px] cursor-pointer hover:border-[--border-strong] transition-all"
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                  notifEsg
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#0A0D14]"
                    : "border-[var(--border-strong)]"
                )}>
                  {notifEsg && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[--text-primary]">ESG compliance Updates</span>
                  <span className="text-[10px] text-[--text-secondary] mt-0.5">Carbon emissions threshold warnings, weekly compliance reporting flags, and audit summaries.</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNotifications}
                className="bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90 transition-all font-sans text-xs font-bold px-4 py-1.5 rounded-[6px] cursor-pointer"
              >
                Save Subscriptions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DIALOGS */}
      {/* ========================================================================= */}

      {/* 1. SAML SSO Modal */}
      {showSAMLModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[--border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                  SAML Single Sign-On
                </h3>
              </div>
              <button
                onClick={() => setShowSAMLModal(false)}
                className="p-1 rounded text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSAML} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Entity ID / Issuer URI
                </label>
                <input
                  type="text"
                  value={samlEntityId}
                  onChange={(e) => setSamlEntityId(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[--text-primary] outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Single Sign-On Service URL
                </label>
                <input
                  type="text"
                  value={samlSsoUrl}
                  onChange={(e) => setSamlSsoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[--text-primary] outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  X.509 Certificate (PEM Format)
                </label>
                <textarea
                  value={samlCert}
                  onChange={(e) => setSamlCert(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[--text-primary] outline-none focus:border-[#00D4AA] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSAMLModal(false)}
                  className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-transparent text-xs font-sans font-semibold text-[--text-primary] hover:bg-[--bg-hover] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[--accent-primary] text-[#0A0D14] text-xs font-sans font-semibold hover:bg-[--accent-primary]/90 cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Delete Tenant Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[10px] border border-[--color-status-critical]/40 bg-[--bg-surface] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[--border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[--color-status-critical]" />
                <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                  Delete Tenant Sovrinn?
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmInput('')
                }}
                className="p-1 rounded text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[--text-secondary] leading-relaxed font-sans">
              This action is <strong className="text-[--text-primary]">irreversible</strong>. This will permanently delete the organization <strong className="text-[--text-primary]">Sovrinn</strong>, including all buildings telemetry, dashboards, active alerts, and developer settings.
            </p>
            <p className="text-xs text-[--text-secondary] font-sans">
              Please type <strong className="text-[--text-primary] font-mono select-none">Sovrinn</strong> to confirm deletion:
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="Sovrinn"
                className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[--text-primary] placeholder-[--text-muted] outline-none focus:border-[--color-status-critical]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmInput('')
                  }}
                  className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-transparent text-xs font-sans font-semibold text-[--text-primary] hover:bg-[--bg-hover] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTenant}
                  disabled={deleteConfirmInput !== 'Sovrinn'}
                  className={cn(
                    'px-4 py-1.5 rounded-[6px] text-xs font-sans font-semibold transition-all cursor-pointer',
                    deleteConfirmInput === 'Sovrinn'
                      ? 'bg-[--color-status-critical] text-white hover:bg-[--color-status-critical]/90'
                      : 'bg-[--bg-elevated] text-[--text-disabled] border border-[--border-default] cursor-not-allowed'
                  )}
                >
                  Delete Tenant Permanent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[--border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                  Invite Organization Member
                </h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-sans text-[--text-primary] outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john.doe@completeproperty.co.za"
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-sans text-[--text-primary] outline-none focus:border-[#00D4AA]"
                />
              </div>

              {/* Role Select in Modal */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Role Permissions
                </label>
                <button
                  type="button"
                  onClick={() => setShowInviteRoleDropdown(!showInviteRoleDropdown)}
                  className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                >
                  <span>{inviteRole}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                </button>
                {showInviteRoleDropdown && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                    {(['Admin', 'Manager', 'Engineer', 'Viewer'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setInviteRole(r)
                          setShowInviteRoleDropdown(false)
                        }}
                        className={cn(
                          'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                          inviteRole === r && 'bg-[--bg-active]'
                        )}
                      >
                        <span>{r}</span>
                        {inviteRole === r && <Check className="w-3 h-3 text-[--accent-primary]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-transparent text-xs font-sans font-semibold text-[--text-primary] hover:bg-[--bg-hover] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[--accent-primary] text-[#0A0D14] text-xs font-sans font-semibold hover:bg-[--accent-primary]/90 cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Generate API Key Modal */}
      {showGenKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[--border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                  Generate API Access Key
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowGenKeyModal(false)
                  setGeneratedKey(null)
                }}
                className="p-1 rounded text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated Result View */}
            {generatedKey ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-[6px] flex gap-2.5 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-sans text-amber-200/90 leading-relaxed">
                    Make sure to copy your API key now. For security purposes, it will not be displayed again after you close this modal.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[--bg-card] border border-[--border-strong] p-3 rounded-[6px] font-mono text-xs text-[--text-primary]">
                  <span className="select-all break-all pr-2">{generatedKey}</span>
                  <button
                    onClick={() => handleCopyText(generatedKey, 'newGenKey', 'API Key')}
                    className="p-1.5 hover:bg-[--bg-hover] rounded transition-colors text-[--text-muted] hover:text-[--text-primary] shrink-0"
                    title="Copy API Key"
                  >
                    {copiedTextMap['newGenKey'] ? (
                      <Check className="w-4 h-4 text-[#00D4AA]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowGenKeyModal(false)
                      setGeneratedKey(null)
                    }}
                    className="px-4 py-1.5 rounded-[6px] bg-[--accent-primary] text-[#0A0D14] text-xs font-sans font-semibold hover:bg-[--accent-primary]/90 cursor-pointer font-bold"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    Key Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Jenkins BI Sync"
                    className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-sans text-[--text-primary] outline-none focus:border-[#00D4AA]"
                  />
                </div>

                {/* Env Select */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    Environment
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewKeyEnvDropdown(!showNewKeyEnvDropdown)}
                    className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                  >
                    <span>{newKeyEnv}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                  </button>
                  {showNewKeyEnvDropdown && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                      {(['LIVE', 'TEST'] as const).map((env) => (
                        <button
                          key={env}
                          type="button"
                          onClick={() => {
                            setNewKeyEnv(env)
                            setShowNewKeyEnvDropdown(false)
                          }}
                          className={cn(
                            'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                            newKeyEnv === env && 'bg-[--bg-active]'
                          )}
                        >
                          <span>{env}</span>
                          {newKeyEnv === env && <Check className="w-3 h-3 text-[--accent-primary]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Permissions Select */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                    Permissions Scope
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewKeyPermsDropdown(!showNewKeyPermsDropdown)}
                    className="flex justify-between items-center px-3 py-2 text-xs bg-[--bg-elevated] border border-[--border-default] rounded-[4px] text-[--text-primary] cursor-pointer hover:border-[--border-strong] transition-colors font-sans w-full text-left"
                  >
                    <span>{newKeyPerms}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[--text-muted] shrink-0" />
                  </button>
                  {showNewKeyPermsDropdown && (
                    <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 rounded-[4px] border border-[--border-strong] bg-[--bg-elevated] shadow-xl py-1">
                      {(['Write Telemetry', 'Read Only', 'Full Access'] as const).map((perm) => (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => {
                            setNewKeyPerms(perm)
                            setShowNewKeyPermsDropdown(false)
                          }}
                          className={cn(
                            'flex items-center justify-between w-full px-3 py-2 text-left text-xs font-sans hover:bg-[--bg-hover] text-[--text-primary] cursor-pointer',
                            newKeyPerms === perm && 'bg-[--bg-active]'
                          )}
                        >
                          <span>{perm}</span>
                          {newKeyPerms === perm && <Check className="w-3 h-3 text-[--accent-primary]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenKeyModal(false)}
                    className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-transparent text-xs font-sans font-semibold text-[--text-primary] hover:bg-[--bg-hover] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-[--accent-primary] text-[#0A0D14] text-xs font-sans font-semibold hover:bg-[--accent-primary]/90 cursor-pointer"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Add Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[10px] border border-[--border-strong] bg-[--bg-surface] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[--border-subtle] pb-3">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-[--accent-primary]" />
                <h3 className="font-sans text-base font-semibold text-[--text-primary]">
                  Add Webhook Endpoint
                </h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="p-1 rounded text-[--text-muted] hover:text-[--text-primary] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWebhook} className="space-y-4 font-sans text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhook"
                  className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[--text-primary] outline-none focus:border-[#00D4AA]"
                />
              </div>

              {/* Subscribed Events list */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-[--text-secondary]">
                  Event Subscriptions
                </label>
                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  {webhookEventOptions.map((ev) => {
                    const isSelected = newWebhookEvents.includes(ev)
                    return (
                      <div
                        key={ev}
                        onClick={() => toggleWebhookEventSelection(ev)}
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          isSelected 
                            ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[#0A0D14]" 
                            : "border-[var(--border-strong)]"
                        )}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-[--text-primary]">{ev}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-1.5 rounded-[6px] border border-[--border-default] bg-transparent text-xs font-sans font-semibold text-[--text-primary] hover:bg-[--bg-hover] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWebhookUrl || newWebhookEvents.length === 0}
                  className={cn(
                    'px-4 py-1.5 rounded-[6px] text-xs font-sans font-semibold transition-all cursor-pointer',
                    (newWebhookUrl && newWebhookEvents.length > 0)
                      ? 'bg-[--accent-primary] text-[#0A0D14] hover:bg-[--accent-primary]/90'
                      : 'bg-[--bg-elevated] text-[--text-disabled] border border-[--border-default] cursor-not-allowed'
                  )}
                >
                  Add Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
