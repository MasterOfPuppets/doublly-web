import { useState, useRef, useEffect } from 'react'
import type { AccountTreeDto, MovementDto } from '../../types'
import { accountService, movementService } from '../../services/accountService'
import { useAccountStore } from '../../stores/accountStore'
import { computeBudgetDelta, type BudgetDeltaMode } from '../../lib/accountState'
import { formatCurrencyEUR } from '../../lib/currency'
import { useAppDialog } from './AppDialog'
import { useDroppable, useDndContext, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function MovementRow({ mov, projectId }: { mov: MovementDto; projectId: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `mov:${mov.id}` })
  const { fetchTree } = useAccountStore()

  const [editDesc, setEditDesc] = useState(mov.description ?? '')
  const [editDate, setEditDate] = useState(mov.movementDate.slice(0, 10))
  const [editAmount, setEditAmount] = useState(String(mov.amount))
  const [activeField, setActiveField] = useState<'desc' | 'date' | 'amount' | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const deleteRef = useRef<HTMLDivElement>(null)

  // sync values when mov updates after fetchTree
  useEffect(() => {
    if (activeField === null) {
      setEditDesc(mov.description ?? '')
      setEditDate(mov.movementDate.slice(0, 10))
      setEditAmount(String(mov.amount))
    }
  }, [mov.description, mov.movementDate, mov.amount])

  useEffect(() => {
    if (!deleteConfirm) return
    function handle(e: MouseEvent) {
      if (deleteRef.current && !deleteRef.current.contains(e.target as Node)) setDeleteConfirm(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [deleteConfirm])

  async function saveField(field: 'desc' | 'date' | 'amount', value: string) {
    setActiveField(null)
    const payload: Parameters<typeof movementService.updateMovement>[1] = {}
    if (field === 'desc') payload.description = value.trim() || undefined
    if (field === 'date') payload.movementDate = value + 'T00:00:00Z'
    if (field === 'amount') payload.amount = parseFloat(value) || mov.amount
    try {
      await movementService.updateMovement(mov.id, payload)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Save movement field failed', e)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>, field: 'desc' | 'date' | 'amount', value: string) {
    if (e.key === 'Enter') { e.preventDefault(); saveField(field, value) }
    if (e.key === 'Escape') {
      if (field === 'desc') setEditDesc(mov.description ?? '')
      if (field === 'date') setEditDate(mov.movementDate.slice(0, 10))
      if (field === 'amount') setEditAmount(String(mov.amount))
      setActiveField(null)
    }
  }

  async function doDelete() {
    setDeleteConfirm(false)
    try {
      await movementService.deleteMovement(mov.id)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Delete movement failed', e)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`group ml-6 flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors hover:border-gray-300 hover:bg-gray-100 ${isDragging ? 'opacity-30' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        tabIndex={-1}
      >
        ⠿
      </button>

      {/* Description */}
      {activeField === 'desc' ? (
        <input
          autoFocus
          className="flex-1 rounded border border-indigo-300 bg-white px-2 py-0.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100"
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onBlur={() => saveField('desc', editDesc)}
          onKeyDown={(e) => handleKey(e, 'desc', editDesc)}
        />
      ) : (
        <span
          className="flex-1 cursor-text text-gray-600 hover:text-gray-900"
          onClick={() => setActiveField('desc')}
        >
          {editDesc || <span className="italic text-gray-400">—</span>}
        </span>
      )}

      {/* Date */}
      {activeField === 'date' ? (
        <input
          autoFocus
          type="date"
          className="rounded border border-indigo-300 bg-white px-2 py-0.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          onBlur={() => saveField('date', editDate)}
          onKeyDown={(e) => handleKey(e, 'date', editDate)}
        />
      ) : (
        <span
          className="cursor-text whitespace-nowrap text-gray-400 hover:text-gray-600"
          onClick={() => setActiveField('date')}
        >
          {new Date(editDate + 'T12:00:00').toLocaleDateString('pt-PT')}
        </span>
      )}

      {/* Amount */}
      {activeField === 'amount' ? (
        <input
          autoFocus
          type="number"
          step="0.01"
          className="w-24 rounded border border-indigo-300 bg-white px-2 py-0.5 text-right text-sm outline-none focus:ring-2 focus:ring-indigo-100"
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          onBlur={() => saveField('amount', editAmount)}
          onKeyDown={(e) => handleKey(e, 'amount', editAmount)}
        />
      ) : (
        <span
          className="cursor-text whitespace-nowrap font-semibold text-gray-800 hover:text-indigo-700"
          onClick={() => setActiveField('amount')}
        >
          {formatCurrencyEUR(parseFloat(editAmount) || 0)}
        </span>
      )}

      {/* Expand to account — only for non-consolidation movements */}
      {!mov.isConsolidation && (
        <button
          onClick={async () => {
            try {
              await accountService.transformMovementToAccount(mov.id)
              await fetchTree(projectId)
            } catch (e) {
              console.error('Transform movement to account failed', e)
            }
          }}
          title="Expand to account"
          className="rounded p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Revert consolidation — only for consolidation movements */}
      {mov.isConsolidation && (
        <button
          onClick={async () => {
            try {
              await movementService.revertConsolidation(mov.id)
              await fetchTree(projectId)
            } catch (e) {
              console.error('Revert consolidation failed', e)
            }
          }}
          title="Revert consolidation"
          className="rounded p-1 text-amber-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-amber-50 hover:text-amber-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Delete — inline popover */}
      <div className="relative" ref={deleteRef}>
        <button
          onClick={() => setDeleteConfirm((v) => !v)}
          className="rounded p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        {deleteConfirm && (
          <div className="absolute right-0 top-8 z-20 flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
            <span className="text-xs text-gray-600">Delete?</span>
            <button onClick={doDelete} className="rounded bg-red-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-600">Yes</button>
            <button onClick={() => setDeleteConfirm(false)} className="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100">No</button>
          </div>
        )}
      </div>
    </div>
  )
}

interface Props {
  node: AccountTreeDto
  projectId: string
  depth?: number
  parentId?: string
  grandparentId?: string
  siblingIds?: string[]
}

export function AccountTreeNode({ node, projectId, depth = 0, parentId, grandparentId, siblingIds }: Props) {
  const budgetDeltaMode: BudgetDeltaMode = 'remaining'
  const { fetchTree, toggleCollapsed, isCollapsed } = useAccountStore()
  const { confirm } = useAppDialog()
  const { active } = useDndContext()
  const isDragActive = active !== null
  const isBeingDragged = active?.id === node.id
  const expanded = !isCollapsed(node.id)

  // Draggable (for reparent drag — no sortable)
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ id: node.id, disabled: depth === 0 })

  // Droppable "into" zone — reparent
  const { setNodeRef: setInsideRef, isOver: isInsideOver } = useDroppable({
    id: `into:${node.id}`,
    disabled: !isDragActive || isBeingDragged,
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Add sub-account modal
  const [addSubOpen, setAddSubOpen] = useState(false)
  const [subName, setSubName] = useState('')
  const [subBudget, setSubBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Add movement modal
  const [addMovOpen, setAddMovOpen] = useState(false)
  const [movDescription, setMovDescription] = useState('')
  const [movAmount, setMovAmount] = useState('')
  const [movDate, setMovDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [movSubmitting, setMovSubmitting] = useState(false)
  const [movError, setMovError] = useState<string | null>(null)
  const movDescRef = useRef<HTMLInputElement>(null)
  const movAmountRef = useRef<HTMLInputElement>(null)

  // Edit in-place and inline delete
  const [editingName, setEditingName] = useState(false)
  const [editNameVal, setEditNameVal] = useState(node.name)
  const [editingBudget, setEditingBudget] = useState(false)
  const [editBudgetVal, setEditBudgetVal] = useState(String(node.referenceValue))

  const budget = node.referenceValue ?? 0
  const totalSpent = node.totalAmount ?? 0
  const budgetDelta = computeBudgetDelta(budget, totalSpent, budgetDeltaMode)

  const hasChildren = node.subAccounts.length > 0 || node.movements.length > 0

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openAddSub() {
    setMenuOpen(false)
    setSubName('')
    setSubBudget('')
    setSubmitError(null)
    setAddSubOpen(true)
  }

  async function handlePromote() {
    setMenuOpen(false)
    if (!grandparentId) return
    try {
      await accountService.moveAccount(node.id, grandparentId)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Promote failed', e)
    }
  }

  async function handleMoveUp() {
    setMenuOpen(false)
    if (!siblingIds || !parentId) return
    const idx = siblingIds.indexOf(node.id)
    if (idx <= 0) return
    const next = [...siblingIds]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    try {
      await accountService.reorderAccounts(parentId, next)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Move up failed', e)
    }
  }

  async function handleMoveDown() {
    setMenuOpen(false)
    if (!siblingIds || !parentId) return
    const idx = siblingIds.indexOf(node.id)
    if (idx >= siblingIds.length - 1) return
    const next = [...siblingIds]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    try {
      await accountService.reorderAccounts(parentId, next)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Move down failed', e)
    }
  }

  async function handleAddSub(e: React.FormEvent) {
    e.preventDefault()
    if (!subName.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await accountService.createAccount({
        name: subName.trim(),
        parentAccountId: node.id,
        referenceValue: subBudget ? parseFloat(subBudget) : 0,
      })
      setAddSubOpen(false)
      await fetchTree(projectId)
    } catch {
      setSubmitError('Failed to create sub-account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function openAddMov() {
    setMenuOpen(false)
    setMovDescription('')
    setMovAmount('')
    setMovDate(new Date().toISOString().slice(0, 10))
    setMovError(null)
    setAddMovOpen(true)
  }

  function closeAddMov() {
    setAddMovOpen(false)
    setMovError(null)
  }

  function resetMovementForm() {
    setMovDate(new Date().toISOString().slice(0, 10))
    setMovDescription('')
    setMovAmount('')
    setMovError(null)
  }

  async function saveMovement(): Promise<boolean> {
    if (!movAmount) return false
    setMovSubmitting(true)
    setMovError(null)
    try {
      await movementService.createMovement({
        accountId: node.id,
        amount: parseFloat(movAmount),
        movementDate: movDate + 'T00:00:00Z',
        description: movDescription.trim() || undefined,
      })
      await fetchTree(projectId)
      return true
    } catch {
      setMovError('Failed to add movement. Please try again.')
      return false
    } finally {
      setMovSubmitting(false)
    }
  }

  async function submitMovementAndClose() {
    if (await saveMovement()) closeAddMov()
  }

  async function submitMovementAndContinue() {
    if (await saveMovement()) {
      resetMovementForm()
      setTimeout(() => movDescRef.current?.focus(), 50)
    }
  }

  async function handleAddMov(e: React.SyntheticEvent) {
    e.preventDefault()
    await submitMovementAndClose()
  }

  async function handleAddMovAndContinue(e: React.SyntheticEvent) {
    e.preventDefault()
    await submitMovementAndContinue()
  }

  function handleAddMovModalKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== 'Escape') return
    e.preventDefault()
    closeAddMov()
  }

  function handleDateFieldKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    movDescRef.current?.focus()
  }

  function handleDescriptionFieldKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    movAmountRef.current?.focus()
  }

  function handleAmountFieldKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (movSubmitting || !movAmount) return
    void submitMovementAndContinue()
  }

  async function handleConsolidate() {
    setMenuOpen(false)
    try {
      await accountService.consolidateToMovement(node.id)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Consolidate failed', e)
    }
  }

  async function saveAccountName() {
    setEditingName(false)
    if (!editNameVal.trim() || editNameVal.trim() === node.name) return
    try {
      await accountService.updateAccount(node.id, { name: editNameVal.trim() })
      await fetchTree(projectId)
    } catch (e) {
      console.error('Save account name failed', e)
      setEditNameVal(node.name)
    }
  }

  async function saveAccountBudget() {
    setEditingBudget(false)
    const val = parseFloat(editBudgetVal) || 0
    if (val === node.referenceValue) return
    try {
      await accountService.updateAccount(node.id, { referenceValue: val })
      await fetchTree(projectId)
    } catch (e) {
      console.error('Save account budget failed', e)
      setEditBudgetVal(String(node.referenceValue))
    }
  }

  async function handleDeleteAcc() {
    setMenuOpen(false)
    const ok = await confirm('Delete this account and all nested items?', {
      title: 'Delete account',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    })
    if (!ok) return
    try {
      await accountService.deleteAccount(node.id)
      await fetchTree(projectId)
    } catch (e) {
      console.error('Delete account failed', e)
    }
  }

  // Merge draggable + droppable refs onto the card
  const mergedRowRef = (el: HTMLDivElement | null) => {
    if (depth > 0) setDragRef(el)
    setInsideRef(el)
  }

  return (
    <>
      {/* Outer wrapper — carries the transform and indentation */}
      <div
        style={depth > 0 && transform ? { transform: CSS.Translate.toString(transform) } : undefined}
        className={`${depth > 0 ? 'border-l border-gray-100 pl-6' : ''} ${isDragging ? 'opacity-30' : ''}`}
      >
        {/* Node row — sortable + droppable ref here so collision rect = card only */}
        <div
          ref={mergedRowRef}
          className={`group flex items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm transition-colors ${
            isInsideOver
              ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
          }`}
        >
          {/* Drag handle — only for non-root nodes */}
          {depth > 0 && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
              tabIndex={-1}
            >
              ⠿
            </button>
          )}
          {/* Expand/collapse toggle */}
          <button
            onClick={() => toggleCollapsed(node.id)}
            className="flex h-8 w-8 items-center justify-center text-xl text-gray-400 hover:text-gray-700"
          >
            {hasChildren ? (expanded ? '▾' : '▸') : ''}
          </button>

          {/* Name — edit in place */}
          {editingName ? (
            <input
              autoFocus
              className="flex-1 rounded border border-indigo-300 bg-white px-2 py-0.5 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-indigo-100"
              value={editNameVal}
              onChange={(e) => setEditNameVal(e.target.value)}
              onBlur={saveAccountName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveAccountName()
                if (e.key === 'Escape') { setEditNameVal(node.name); setEditingName(false) }
              }}
            />
          ) : (
            <span
              className="flex-1 cursor-text font-medium text-gray-900"
              onClick={() => { setMenuOpen(false); setEditingName(true) }}
            >
              {editNameVal}
            </span>
          )}

          {/* Financials */}
          <div className="hidden w-[560px] grid-cols-[190px_170px_170px] items-center gap-4 text-sm sm:grid">
            <span className="tabular-nums text-gray-400">
              Budget:{' '}
              {editingBudget ? (
                <input
                  autoFocus
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-24 rounded border border-indigo-300 bg-white px-1 py-0 text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  value={editBudgetVal}
                  onChange={(e) => setEditBudgetVal(e.target.value)}
                  onBlur={saveAccountBudget}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveAccountBudget()
                    if (e.key === 'Escape') { setEditBudgetVal(String(node.referenceValue)); setEditingBudget(false) }
                  }}
                />
              ) : (
                <span
                  className="cursor-text text-gray-600"
                  onClick={() => { setMenuOpen(false); setEditingBudget(true) }}
                >
                  {formatCurrencyEUR(parseFloat(editBudgetVal) || 0)}
                </span>
              )}
            </span>
            <span className="tabular-nums text-gray-400">
              Total: <span className="font-semibold text-gray-800">{formatCurrencyEUR(totalSpent)}</span>
            </span>
            <span className={`justify-self-end tabular-nums font-semibold ${budgetDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {budgetDelta > 0 ? '+' : ''}{formatCurrencyEUR(budgetDelta)}
            </span>
          </div>

          <div className="flex w-28 items-center justify-end gap-1">
            <button
              type="button"
              onClick={openAddMov}
              className="rounded-md px-2 py-1 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              title="Add movement"
            >
              +
            </button>

            {/* Context menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-md px-2 py-1 text-base font-bold leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ···
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={openAddSub}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    + Add sub-account
                  </button>
                  <hr className="my-1 border-gray-100" />
                  {siblingIds && siblingIds.indexOf(node.id) > 0 && (
                    <button
                      onClick={handleMoveUp}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ↑ Move up
                    </button>
                  )}
                  {siblingIds && siblingIds.indexOf(node.id) < siblingIds.length - 1 && (
                    <button
                      onClick={handleMoveDown}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ↓ Move down
                    </button>
                  )}
                  {grandparentId !== undefined && (
                    <>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handlePromote}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        ↑ Promote
                      </button>
                      <button
                        onClick={handleConsolidate}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        ↦ Consolidate to movement
                      </button>
                    </>
                  )}
                  {depth > 0 && (
                    <>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleDeleteAcc}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {expanded && (
          <div className="mt-2 space-y-2">
            {node.subAccounts.map((child) => (
              <AccountTreeNode
                key={child.id}
                node={child}
                projectId={projectId}
                depth={depth + 1}
                parentId={node.id}
                grandparentId={parentId}
                siblingIds={node.subAccounts.map(c => c.id)}
              />
            ))}
            {node.movements.map((mov) => (
              <MovementRow key={mov.id} mov={mov} projectId={projectId} />
            ))}
          </div>
        )}
      </div>

      {/* Add movement modal */}
      {addMovOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={closeAddMov}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-base font-semibold text-gray-900">Add movement</h2>
            <p className="mb-5 text-sm text-gray-500">To <span className="font-medium text-gray-700">{node.name}</span></p>

            <form
              onSubmit={handleAddMovAndContinue}
              onKeyDown={handleAddMovModalKeyDown}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Date *</label>
                <input
                  type="date"
                  value={movDate}
                  onChange={(e) => setMovDate(e.target.value)}
                  onKeyDown={handleDateFieldKeyDown}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <input
                  ref={movDescRef}
                  autoFocus
                  value={movDescription}
                  onChange={(e) => setMovDescription(e.target.value)}
                  onKeyDown={handleDescriptionFieldKeyDown}
                  placeholder="e.g. January invoice"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Amount *</label>
                <input
                  ref={movAmountRef}
                  type="number"
                  step="0.01"
                  value={movAmount}
                  onChange={(e) => setMovAmount(e.target.value)}
                  onKeyDown={handleAmountFieldKeyDown}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {movError && (
                <p className="text-xs text-red-500">{movError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeAddMov}
                  className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Escape
                </button>
                <button
                  type="submit"
                  disabled={movSubmitting || !movAmount}
                  className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {movSubmitting ? 'Saving…' : 'Save & continue'}
                </button>
                <button
                  type="button"
                  onClick={handleAddMov}
                  disabled={movSubmitting || !movAmount}
                  className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                >
                  {movSubmitting ? 'Saving…' : 'Save & close'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add sub-account modal */}
      {addSubOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setAddSubOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-base font-semibold text-gray-900">New sub-account</h2>
            <p className="mb-5 text-sm text-gray-500">Under <span className="font-medium text-gray-700">{node.name}</span></p>

            <form onSubmit={handleAddSub} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Name *</label>
                <input
                  autoFocus
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Salaries"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Budget (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={subBudget}
                  onChange={(e) => setSubBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-500">{submitError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAddSubOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !subName.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  )
}
