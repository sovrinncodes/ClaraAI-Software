'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench,
  Sparkles,
  GripVertical,
  Trash2,
  Plus,
  Calendar,
  AlertOctagon,
  ShoppingCart,
  CheckCircle,
  X,
  ChevronRight
} from 'lucide-react'
import { useWorkOrderStore } from '@/lib/stores/work-order-store'
import { cn } from '@/lib/utils/cn'

// Pre-defined pre-fill data based on asset
const PREFILL_DATA: Record<string, {
  title: string
  assetCode: string
  assetName: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  description: string
  tasks: string[]
  assigneeName: string
  assigneeAvatar?: string
  scheduledDate: string
  alertTitle: string
  alertTime: string
  alertMetric: string
  aiInsightText: string
  predictedTtf: string
  confidence: string
  partNumber: string
  partDescription: string
  partInStock: boolean
}> = {
  asset_chl_01: {
    title: 'Bearing Inspection and Part Replacement',
    assetCode: 'CHL-01',
    assetName: 'Centrifugal Chiller',
    priority: 'Critical',
    description: 'Clara AI detected high confidence (89.4%) of Stage 2 Compressor Shaft Bearing Wear based on a 420% increase in vibration amplitude at 3X running speed (298Hz). Immediate inspection required to prevent critical failure within estimated 45 days. Equipment is currently operating at reduced load to mitigate immediate risk.',
    tasks: [
      'Reduce operating load to <70%',
      'Perform visual inspection of Stage 2 Compressor Shaft Bearing',
      'Order replacement part #BRG-YK-02 if needed'
    ],
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    scheduledDate: '2024-10-15',
    alertTitle: 'Vibration Threshold Exceeded',
    alertTime: 'Oct 14, 08:14 AM',
    alertMetric: 'Peak: 14.2 mm/s',
    aiInsightText: 'The FFT spectrum shows a sudden 420% increase in amplitude at the 3X running speed harmonic (298Hz) over the last 48 hours. This is highly indicative of Stage 2 bearing wear.',
    predictedTtf: '45 Days',
    confidence: '89.4%',
    partNumber: '#BRG-YK-02',
    partDescription: 'Stage 2 Shaft Bearing',
    partInStock: false
  },
  asset_crac_02: {
    title: 'Compressor Overheat Inspection',
    assetCode: 'CRAC-02',
    assetName: 'Computer Room Air Conditioning',
    priority: 'Critical',
    description: 'Clara AI detected high confidence (91.0%) of Compressor Overheat based on return air temp of 26.8 °C and compressor load of 97%. Immediate inspection required to verify coolant levels and fan motor functionality.',
    tasks: [
      'Isolate CRAC-02 compressor unit',
      'Verify compressor coil temperature and coolant levels',
      'Inspect return air sensor wiring and fan shroud alignment'
    ],
    assigneeName: 'Thabo Mokoena',
    assigneeAvatar: '/avatar_thandiwe.png',
    scheduledDate: '2024-10-16',
    alertTitle: 'Compressor Overheat Anomaly',
    alertTime: 'Today, 10:12 AM',
    alertMetric: 'Peak: 85.0 °C',
    aiInsightText: 'Elevated return air temperature coupled with maximum compressor load indicates low refrigerant pressure or a thermal block.',
    predictedTtf: '12 Days',
    confidence: '91.0%',
    partNumber: '#FLT-9022A',
    partDescription: 'Refrigerant Filter element',
    partInStock: true
  }
}

export default function CreateWorkOrderPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = (params?.assetId as string) || 'asset_chl_01'
  const addWorkOrder = useWorkOrderStore((state) => state.addWorkOrder)

  // Get pre-fill details or default to CHL-01
  const data = PREFILL_DATA[assetId] || PREFILL_DATA.asset_chl_01

  // Form states
  const [title, setTitle] = useState(data.title)
  const [priority, setPriority] = useState(data.priority)
  const [description, setDescription] = useState(data.description)
  const [tasks, setTasks] = useState<string[]>(data.tasks)
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [assignee, setAssignee] = useState(data.assigneeName)
  const [scheduledDate, setScheduledDate] = useState(data.scheduledDate)

  // Interactive UI states
  const [partProcured, setPartProcured] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks([...tasks, newTaskText.trim()])
      setNewTaskText('')
      setShowAddTask(false)
      showToast('Task added to checklist')
    }
  }

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
    showToast('Task removed from checklist')
  }

  const handleRequestProcurement = () => {
    setPartProcured(true)
    showToast('Procurement request generated successfully for ' + data.partNumber)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      addWorkOrder({
        title,
        assetId,
        assetCode: data.assetCode,
        assetName: data.assetName,
        facilityId: 'fac_jhb_dc_01',
        facilityName: 'Johannesburg DC-1',
        priority,
        status: 'Open',
        assigneeName: assignee,
        assigneeAvatar: assignee === 'Thabo Mokoena' ? '/avatar_thandiwe.png' : '/avatar_sipho.png',
        dueDate: new Date(scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description,
        tasks,
        parts: [
          {
            partNumber: data.partNumber,
            description: data.partDescription,
            status: partProcured ? 'Requested' : (data.partInStock ? 'In Stock' : 'Out of Stock')
          }
        ],
        sourceAlert: {
          title: data.alertTitle,
          time: data.alertTime,
          metric: data.alertMetric
        },
        aiInsight: {
          text: data.aiInsightText,
          predictedTtfDays: parseInt(data.predictedTtf),
          confidence: parseFloat(data.confidence)
        }
      })
      
      showToast('Work order created successfully! Redirecting...')
      setTimeout(() => {
        router.push('/workorders')
      }, 800)
    })
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-xl bg-[var(--bg-elevated)] border-[var(--border-strong)] animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-4 h-4 text-[#00D4AA]" />
          <span className="font-mono text-xs text-[var(--text-primary)]">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:text-[var(--text-primary)] text-[var(--text-muted)]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-secondary)]">
        <Link href="/equipment" className="hover:text-[var(--text-primary)] transition-colors">
          Equipment Health
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/equipment/${assetId}`} className="hover:text-[var(--text-primary)] transition-colors">
          Johannesburg DC-1
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/equipment/${assetId}`} className="hover:text-[var(--text-primary)] transition-colors">
          {data.assetCode}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[var(--text-muted)]">Create Work Order</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-mono text-2xl font-light tracking-wide text-[var(--text-primary)] mb-1">
          Create Work Order
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-mono">
          Issue a maintenance task for {data.assetCode} ({data.assetName})
        </p>
      </div>

      {/* Grid Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (Form, spanning 3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div
            className="rounded-[10px] border p-6 flex flex-col gap-6"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            {/* Header of Form Block */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#00D4AA]" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  Work Order Details
                </h2>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider bg-[rgba(0,212,170,0.1)] border-[rgba(0,212,170,0.2)] text-[#00D4AA]">
                <Sparkles className="w-3 h-3 fill-current" />
                AI Pre-filled
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Work Order Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-[6px] border text-xs font-mono bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors"
                />
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Priority Level
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2 pl-8 rounded-[6px] border text-xs font-mono bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <span className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                    priority === 'Critical' && 'bg-[var(--status-critical)]',
                    priority === 'High' && 'bg-[var(--status-critical)]',
                    priority === 'Medium' && 'bg-[var(--status-warning)]',
                    priority === 'Low' && 'bg-[var(--text-muted)]'
                  )} />
                </div>
              </div>

              {/* Target Asset (Prefilled/Disabled style) */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Target Asset
                </label>
                <input
                  type="text"
                  disabled
                  value={`${data.assetCode} (${data.assetName})`}
                  className="px-3.5 py-2 rounded-[6px] border text-xs font-mono bg-[var(--bg-active)] border-[var(--border-default)] text-[var(--text-secondary)]"
                />
              </div>

              {/* Assignee */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Assignee
                </label>
                <div className="relative">
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[6px] border text-xs font-mono bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Thabo Mokoena">Thabo Mokoena</option>
                    <option value="Sibusiso M.">Sibusiso M.</option>
                    <option value="Sipho Ndlovu">Sipho Ndlovu</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Date */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Scheduled Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 pr-9 rounded-[6px] border text-xs font-mono bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                Issue Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3.5 py-3 rounded-[6px] border text-xs font-mono bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Tasks Checklist */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                  Tasks / Checklist
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTask(!showAddTask)}
                  className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#00D4AA] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              {/* Add Task Input Block */}
              {showAddTask && (
                <div className="flex gap-2 p-3 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)]">
                  <input
                    type="text"
                    placeholder="Describe new checklist action..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded border text-xs font-mono bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTask()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="px-3 py-1.5 rounded font-mono text-xs font-bold bg-[#00D4AA] text-[#0A0D14]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tasks Checklist rows */}
              <div className="flex flex-col gap-2">
                {tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-[6px] border group hover:border-[var(--border-strong)] transition-all bg-[var(--bg-elevated)] border-[var(--border-default)]"
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-grab shrink-0" />
                    <span className="font-mono text-xs text-[var(--text-primary)] flex-1 leading-relaxed">
                      {task}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(idx)}
                      className="text-[var(--text-muted)] hover:text-[var(--status-critical)] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions bottom row */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/equipment/${assetId}`}
              className="px-4 py-2 rounded-[6px] border text-xs font-mono font-bold border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-1.5 text-[#0A0D14] hover:shadow-[0_0_15px_rgba(0,212,170,0.35)] transition-all font-mono text-xs font-bold px-4 py-2 rounded-[6px] bg-[#00D4AA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span>{isPending ? 'Generating...' : 'Create Work Order'}</span>
            </button>
          </div>
        </div>

        {/* Right Column (Diagnostic Context panel) */}
        <div className="flex flex-col gap-6">
          {/* Diagnostic Context Card */}
          <div
            className="rounded-[10px] border p-5 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Diagnostic Context
              </h3>
            </div>

            <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-[rgba(229,72,77,0.06)] border border-[rgba(229,72,77,0.12)]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Source Alert
              </span>
              <span className="font-mono text-xs font-bold text-[var(--status-critical)] leading-tight">
                {data.alertTitle}
              </span>
              <span className="font-mono text-[9px] text-[var(--text-secondary)]">
                {data.alertTime} • {data.alertMetric}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                AI Insight
              </span>
              <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                {data.aiInsightText}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-4 font-mono">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                  Predicted TTF:
                </span>
                <span className="text-xs font-bold text-[var(--status-warning)]">
                  {data.predictedTtf}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                  Root Confidence:
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {data.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* Required Parts Card */}
          <div
            className="rounded-[10px] border p-5 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Required Parts
              </h3>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-0.5 font-mono">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {data.partNumber}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {data.partDescription}
                </span>
              </div>

              {partProcured ? (
                <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 border-blue-500/20 text-blue-400">
                  Requested
                </span>
              ) : data.partInStock ? (
                <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider bg-green-500/10 border-green-500/20 text-green-400">
                  In Stock
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider bg-red-500/10 border-red-500/20 text-red-400">
                  Out of Stock
                </span>
              )}
            </div>

            {!partProcured && !data.partInStock && (
              <button
                type="button"
                onClick={handleRequestProcurement}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-[6px] border text-xs font-mono font-bold transition-all border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Request Procurement</span>
              </button>
            )}
            {partProcured && (
              <div className="text-center font-mono text-[9px] text-blue-400 p-2 border border-dashed border-blue-500/20 rounded bg-blue-500/5">
                Procurement request has been logged.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
