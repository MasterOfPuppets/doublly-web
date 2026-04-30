/**
 * Utilities for reading account node state from the structured object
 * returned by the API. Parsing/serialization lives in the backend.
 */
import type { AccountTreeDto } from '../types'

/** Collect all node IDs where branchOpen=false (collapsed) recursively */
export function collectCollapsedIds(node: AccountTreeDto, result: Set<string> = new Set()): Set<string> {
  if (!node.nodeState.branchOpen) result.add(node.id)
  node.subAccounts.forEach((child) => collectCollapsedIds(child, result))
  return result
}

