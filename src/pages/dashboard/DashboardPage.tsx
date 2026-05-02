import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountStore } from '../../stores/accountStore'
import { ProjectCard } from '../../components/ui/ProjectCard'
import { accountService, movementService } from '../../services/accountService'

export function DashboardPage() {
  const { projects, projectsLoading, error, fetchProjects } = useAccountStore()
  const navigate = useNavigate()
  const [creatingDemo, setCreatingDemo] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)

  function handleOpenProject(id: string) {
    navigate(`/projects/${id}`)
  }

  function handleEditProject(id: string) {
    navigate(`/projects/${id}/edit`)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  async function handleCreateDemoProject() {
    if (creatingDemo) return

    setCreatingDemo(true)
    setDemoError(null)

    try {
      const today = new Date().toISOString().slice(0, 10) + 'T00:00:00Z'
      const nextProjectNumber = projects.length + 1

      const project = await accountService.createAccount({
        name: `Renovação da cozinha - ${nextProjectNumber}`,
        referenceValue: 5000,
      })

      const createAccount = (name: string, parentAccountId?: string) =>
        accountService.createAccount({ name, referenceValue: 0, parentAccountId })

      const createMovement = (accountId: string, description: string, amount: number) =>
        movementService.createMovement({ accountId, description, amount, movementDate: today })

      const pinturas = await createAccount('Pinturas', project.id)
      const azulejos = await createAccount('Substituição dos azulejos', project.id)
      await createAccount('Substituição do pavimento', project.id)
      await createAccount('Móveis e balcão', project.id)
      await createAccount('Electrodomésticos grandes', project.id)
      await createAccount('Electrodomésticos de bancada', project.id)
      await createAccount('Iluminação', project.id)

      const teto = await createAccount('Teto', pinturas.id)
      const paredes = await createAccount('Paredes', pinturas.id)

      await createMovement(teto.id, 'Tinta branca Leroy Merlin', 450)
      await createMovement(paredes.id, 'Tinta Antifungos e Antibolores', 670)
      await createMovement(pinturas.id, 'Mão de obra', 300)
      await createMovement(azulejos.id, 'Azulejos 40m2', 800)
      await createMovement(azulejos.id, 'Mão de obra 40m2', 500)

      await fetchProjects()
      navigate(`/projects/${project.id}`)
    } catch (e) {
      console.error('Create demo project failed', e)
      setDemoError('Failed to create demo project. Please try again.')
    } finally {
      setCreatingDemo(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Select a project to view its budget tree.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateDemoProject}
            disabled={creatingDemo || projectsLoading}
            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          >
            {creatingDemo ? 'Creating demo…' : 'Get demo project'}
          </button>
          <button
            onClick={() => navigate('/projects/new')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Project
          </button>
        </div>
      </div>

      {demoError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {demoError}
        </div>
      )}

      {projectsLoading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!projectsLoading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <p className="text-gray-400">No projects yet.</p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleCreateDemoProject}
              disabled={creatingDemo || projectsLoading}
              className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50"
            >
              {creatingDemo ? 'Creating demo…' : 'Get demo project'}
            </button>
            <button
              onClick={() => navigate('/projects/new')}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Create your first project
            </button>
          </div>
        </div>
      )}

      {!projectsLoading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={handleOpenProject}
              onEdit={handleEditProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
