import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuthStore } from '../../stores/authStore'
import { useAccountStore } from '../../stores/accountStore'
import { ProjectCard } from '../../components/ui/ProjectCard'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { projects, loading, error, fetchProjects } = useAccountStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">Doublly</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.displayName ?? user?.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-8 py-10">
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

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
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

        {!loading && projects.length > 0 && (
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
      </main>
    </div>
  )
}
