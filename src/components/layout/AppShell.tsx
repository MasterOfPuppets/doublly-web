import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuthStore } from '../../stores/authStore'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function AppShell() {
  const { user } = useAuthStore()
  const [systemMessage, setSystemMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadSystemMessage() {
      try {
        const res = await fetch('/system-message.txt', { cache: 'no-store' })
        if (!res.ok) return
        const text = (await res.text()).trim()
        if (!cancelled) setSystemMessage(text)
      } catch {
        // Ignore when file is absent/unavailable.
      }
    }

    loadSystemMessage()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {systemMessage && (
        <div className="border-b border-sky-200 bg-sky-50 px-8 py-2 text-sm text-sky-800">
          <div className="mx-auto max-w-5xl">{systemMessage}</div>
        </div>
      )}

      <header className="border-b border-gray-200 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-indigo-600">Doublly</span>
            <nav className="flex items-center gap-1">
              <NavItem to="/" label="Projects" />
              <NavItem to="/beta-testers" label="Beta-testers" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-5xl px-8 py-10">
        <Outlet />
      </main>
    </div>
  )
}