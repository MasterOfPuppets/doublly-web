import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountStore } from '../../stores/accountStore'
import { ProjectCard } from '../../components/ui/ProjectCard'

export function DashboardPage() {
  const { projects, projectsLoading, error, fetchProjects } = useAccountStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Select a project to view its budget tree.</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New Project
        </button>
      </div>

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
          <button
            onClick={() => navigate('/projects/new')}
            className="mt-4 text-sm font-medium text-indigo-600 hover:underline"
          >
            Create your first project
          </button>
        </div>
      )}

      {!projectsLoading && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
