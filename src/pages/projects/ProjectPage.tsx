import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useAccountStore } from '../../stores/accountStore'
import { accountService, movementService } from '../../services/accountService'
import { AccountTreeNode } from '../../components/ui/AccountTreeNode'
import type { AccountTreeDto, MovementDto } from '../../types'

function findNode(tree: AccountTreeDto, id: string): AccountTreeDto | null {
  if (tree.id === id) return tree
  for (const child of tree.subAccounts) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

function findMovement(tree: AccountTreeDto, id: string): MovementDto | null {
  for (const mov of tree.movements) {
    if (mov.id === id) return mov
  }
  for (const child of tree.subAccounts) {
    const found = findMovement(child, id)
    if (found) return found
  }
  return null
}

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedTree, loading, error, fetchTree, clearTree } = useAccountStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    if (id) fetchTree(id)
    return () => clearTree()
  }, [id])

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || !selectedTree || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    // Only handle drops onto "into:" zones (reparent)
    if (!overId.startsWith('into:')) return
    const targetParentId = overId.replace('into:', '')

    // Movement drag → move to another account
    if (activeId.startsWith('mov:')) {
      const movId = activeId.replace('mov:', '')
      if (movId === targetParentId) return
      try {
        await movementService.updateMovement(movId, { accountId: targetParentId })
        await fetchTree(id!)
      } catch (e) {
        console.error('Move movement failed', e)
      }
      return
    }

    // Account drag → reparent into target
    if (activeId === targetParentId) return
    try {
      await accountService.moveAccount(activeId, targetParentId)
      await fetchTree(id!)
    } catch (e) {
      console.error('Move account failed', e)
    }
  }

  const activeNode = activeId && selectedTree ? findNode(selectedTree, activeId) : null
  const activeMovId = activeId?.startsWith('mov:') ? activeId.replace('mov:', '') : null
  const activeMov = activeMovId && selectedTree ? findMovement(selectedTree, activeMovId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <span className="text-lg font-bold text-indigo-600">Doublly</span>
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700">
              ← Projects
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-8 py-10">
          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          {!loading && selectedTree && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{selectedTree.name}</h1>
              </div>
              <div className="space-y-2">
                <AccountTreeNode node={selectedTree} projectId={id!} depth={0} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Drag overlay — ghost of dragged item */}
      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-4 py-3 opacity-90 shadow-xl">
            <span className="text-gray-300">⠿</span>
            <span className="font-medium text-gray-900">{activeNode.name}</span>
          </div>
        )}
        {activeMov && (
          <div className="flex items-center gap-4 rounded-lg border border-indigo-300 bg-white px-4 py-2.5 text-sm opacity-90 shadow-xl">
            <span className="text-gray-300">⠿</span>
            <span className="text-gray-600">{activeMov.description ?? '—'}</span>
            <span className="font-semibold text-gray-800">{activeMov.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}