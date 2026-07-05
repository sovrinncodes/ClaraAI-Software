import { create } from 'zustand'

export interface Workspace {
  id: string
  name: string
  code: string
  facilities: number
  assets: number
  color: string
  bgColor: string
}

export const WORKSPACES: Workspace[] = [
  {
    id: 'tenant_cpt',
    name: 'Sovrinn',
    code: 'SOV',
    facilities: 14,
    assets: 42,
    color: '#00D4AA',
    bgColor: 'rgba(0, 212, 170, 0.12)',
  },
  {
    id: 'tenant_nx',
    name: 'NexCore Industrial',
    code: 'NX',
    facilities: 8,
    assets: 31,
    color: '#F5A623',
    bgColor: 'rgba(245, 166, 35, 0.12)',
  },
  {
    id: 'tenant_av',
    name: 'Avantis Data Centers',
    code: 'AV',
    facilities: 5,
    assets: 119,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
  },
  {
    id: 'tenant_pl',
    name: 'Polaris Logistics Group',
    code: 'PL',
    facilities: 22,
    assets: 87,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
  },
  {
    id: 'tenant_sr',
    name: 'Solaris REIT',
    code: 'SR',
    facilities: 6,
    assets: 24,
    color: '#8B96A8',
    bgColor: 'rgba(139, 150, 168, 0.12)',
  },
]

interface WorkspaceStore {
  activeWorkspace: Workspace
  setActiveWorkspace: (workspace: Workspace) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspace: WORKSPACES[0],
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}))
