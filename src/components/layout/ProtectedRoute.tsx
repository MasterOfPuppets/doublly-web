import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface Props {
  children: React.ReactNode
}

const authLoadingMessages = [
  'A validar a tua sessão segura...',
  'A ligar ao teu espaço Doublly...',
  'A preparar projetos, contas e movimentos...',
  'A alinhar tudo para entrares onde ficaste...',
]

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuthStore()
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!loading) return

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % authLoadingMessages.length)
    }, 1800)

    return () => window.clearInterval(intervalId)
  }, [loading])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-indigo-100 bg-white/90 p-8 text-center shadow-xl shadow-indigo-100/60 backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Doublly</p>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">A entrar na tua área</h1>
          <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
            {authLoadingMessages[messageIndex]}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {authLoadingMessages.map((message, index) => (
              <span
                key={message}
                className={`h-2 rounded-full transition-all duration-300 ${index === messageIndex ? 'w-8 bg-indigo-500' : 'w-2 bg-indigo-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
