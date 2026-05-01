import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './lib/firebase'
import { useAuthStore } from './stores/authStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { NewProjectPage } from './pages/projects/NewProjectPage'
import { ProjectPage } from './pages/projects/ProjectPage'
import { BetaTestersPage } from './pages/beta/BetaTestersPage'
import { userService } from './services/userService'
import { FeedbackButton } from './components/ui/FeedbackButton'

async function bootstrapBackendUser(firebaseUser: User) {
  const nameParts = (firebaseUser.displayName ?? '').split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ') || firstName

  await userService.bootstrap({
    email: firebaseUser.email ?? '',
    firstName,
    lastName,
    language: navigator.language.split('-')[0] ?? 'en',
    country: navigator.language.split('-')[1] ?? '',
    defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

export default function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)

      if (firebaseUser) {
        try {
          await bootstrapBackendUser(firebaseUser)
          setUser(firebaseUser)
        } catch (error) {
          console.error('[Auth bootstrap] Failed to prepare backend user', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  return (
    <>
      <Routes>
        <Route path="/login" element={!loading && user ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectPage />} />
          <Route path="beta-testers" element={<BetaTestersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FeedbackButton />
    </>
  )
}