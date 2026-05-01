/**
 * Utilities for reading account node state from the structured object
 * returned by the API. Parsing/serialization lives in the backend.
 */
import type { AccountTreeDto } from '../types'

export type BudgetDeltaMode = 'remaining' | 'deviation'

/** Collect all node IDs where branchOpen=false (collapsed) recursively */
export function collectCollapsedIds(node: AccountTreeDto, result: Set<string> = new Set()): Set<string> {
  if (!node.nodeState.branchOpen) result.add(node.id)
  node.subAccounts.forEach((child) => collectCollapsedIds(child, result))
  return result
}

/**
 * Budget delta rendering modes:
 * - remaining: budget - spent (positive = still can spend)
 * - deviation: spent - budget (positive = overspent)
 */
export function computeBudgetDelta(budget: number, totalSpent: number, mode: BudgetDeltaMode): number {
  if (mode === 'remaining') return budget - totalSpent
  return totalSpent - budget
}

