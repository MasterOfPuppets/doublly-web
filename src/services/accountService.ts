import { api } from './api'
import type { AccountDto, AccountTreeDto, MovementDto } from '../types'

export const accountService = {
  getProjects: () => api.get<AccountDto[]>('/accounts/projects'),

  getAccountTree: (id: string) => api.get<AccountTreeDto>(`/accounts/${id}/tree`),

  getAccountById: (id: string) => api.get<AccountDto>(`/accounts/${id}`),

  createAccount: (data: { name: string; parentAccountId?: string; referenceValue?: number; timezone?: string }) =>
    api.post<AccountDto>('/accounts', data),

  updateAccount: (id: string, data: { name?: string; referenceValue?: number; timezone?: string; nodeState?: { branchOpen: boolean } }) =>
    api.patch<AccountDto>(`/accounts/${id}`, data),

  moveAccount: (id: string, newParentAccountId?: string) => {
    const qs = newParentAccountId ? `?newParentAccountId=${newParentAccountId}` : ''
    return api.patch<AccountDto>(`/accounts/${id}/move${qs}`, {})
  },

  deleteAccount: (id: string) => api.delete<void>(`/accounts/${id}`),

  reorderAccounts: (parentAccountId: string, orderedIds: string[]) =>
    api.patch<void>('/accounts/reorder', { parentAccountId, orderedIds }),

  transformMovementToAccount: (movementId: string) =>
    api.post<AccountDto>(`/accounts/from-movement/${movementId}`, {}),

  consolidateToMovement: (accountId: string) =>
    api.post<MovementDto>(`/accounts/${accountId}/consolidate`, {}),
}

export const movementService = {
  createMovement: (data: { accountId: string; amount: number; movementDate: string; description?: string }) =>
    api.post<MovementDto>('/movements', data),

  updateMovement: (id: string, data: { amount?: number; movementDate?: string; description?: string; accountId?: string }) =>
    api.patch<MovementDto>(`/movements/${id}`, data),

  deleteMovement: (id: string) => api.delete<void>(`/movements/${id}`),

  revertConsolidation: (id: string) => api.post<void>(`/movements/${id}/revert-consolidation`, {}),
}
