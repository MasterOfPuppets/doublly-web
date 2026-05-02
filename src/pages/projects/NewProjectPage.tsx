import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { accountService } from '../../services/accountService'
import { useAccountStore } from '../../stores/accountStore'

export function NewProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { fetchProjects } = useAccountStore()
  const [name, setName] = useState('')
  const [referenceValue, setReferenceValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(Boolean(id))
  const [error, setError] = useState<string | null>(null)
  const isEditMode = Boolean(id)

  useEffect(() => {
    if (!id) {
      setInitialLoading(false)
      return
    }

    const projectId = id

    let cancelled = false

    async function loadProject() {
      setError(null)
      setInitialLoading(true)
      try {
        const project = await accountService.getAccountById(projectId)
        if (cancelled) return
        setName(project.name)
        setReferenceValue(project.referenceValue ? String(project.referenceValue) : '')
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    }

    void loadProject()

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        name,
        referenceValue: referenceValue ? parseFloat(referenceValue) : 0,
      }

      if (id) {
        await accountService.updateAccount(id, payload)
      } else {
        await accountService.createAccount(payload)
      }

      await fetchProjects()
      navigate('/')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-2">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Project' : 'New Project'}</h1>

      {initialLoading ? (
        <div className="flex justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Family Budget 2026"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Budget (reference value)
            </label>
            <input
              type="number"
              value={referenceValue}
              onChange={(e) => setReferenceValue(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Project' : 'Create Project')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
