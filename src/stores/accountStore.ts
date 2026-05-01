import { create } from 'zustand'
import type { AccountDto, AccountTreeDto } from '../types'
import { accountService } from '../services/accountService'
import { collectCollapsedIds } from '../lib/accountState'

interface AccountState {
  projects: AccountDto[]
  selectedTree: AccountTreeDto | null
  projectsLoading: boolean
  treeLoading: boolean
  loading: boolean
  error: string | null
  collapsedIds: Set<string>

  fetchProjects: () => Promise<void>
  fetchTree: (id: string) => Promise<void>
  clearTree: () => void
  toggleCollapsed: (id: string) => void
  isCollapsed: (id: string) => boolean
}

export const useAccountStore = create<AccountState>()((set, get) => ({
  projects: [],
  selectedTree: null,
  projectsLoading: false,
  treeLoading: false,
  loading: false,
  error: null,
  collapsedIds: new Set(),

  fetchProjects: async () => {
    set({ projectsLoading: true, loading: true, error: null })
    try {
      const projects = await accountService.getProjects()
      set({ projects, projectsLoading: false, loading: get().treeLoading })
    } catch (e) {
      set({ error: (e as Error).message, projectsLoading: false, loading: get().treeLoading })
    }
  },

  fetchTree: async (id: string) => {
    set({ treeLoading: true, loading: true, error: null })
    try {
      const tree = await accountService.getAccountTree(id)
      // Initialize collapsed state from each node's persisted state string
      const collapsedIds = collectCollapsedIds(tree)
      set({ selectedTree: tree, treeLoading: false, loading: get().projectsLoading, collapsedIds })
    } catch (e) {
      set({ error: (e as Error).message, treeLoading: false, loading: get().projectsLoading })
    }
  },

  clearTree: () => set({ selectedTree: null, collapsedIds: new Set(), treeLoading: false, loading: get().projectsLoading }),

  toggleCollapsed: (id: string) => {
    const next = new Set(get().collapsedIds)
    const wasCollapsed = next.has(id)
    if (wasCollapsed) next.delete(id)
    else next.add(id)
    set({ collapsedIds: next })
    // Persist to API optimistically (fire and forget)
    accountService.updateAccount(id, { nodeState: { branchOpen: wasCollapsed } }).catch(console.error)
  },

  isCollapsed: (id: string) => get().collapsedIds.has(id),
}))
