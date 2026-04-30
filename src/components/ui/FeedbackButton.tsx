import { useState } from 'react'
import { api } from '../../services/api'

const TYPES = [
  { value: 'bug', label: 'Erro' },
  { value: 'suggestion', label: 'Sugestão' },
  { value: 'missing', label: 'Falta algo' },
]

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('bug')
  const [action, setAction] = useState('')
  const [expected, setExpected] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function reset() {
    setType('bug')
    setAction('')
    setExpected('')
    setDescription('')
    setDone(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/feedback', {
        type,
        action,
        expected,
        description,
        pageUrl: window.location.pathname,
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { reset(); setOpen(true) }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition-colors"
        title="Enviar feedback"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            {done ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-green-600">Obrigado pelo feedback! 🙏</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">Enviar feedback</h2>
                  <button type="button" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                </div>

                {/* Type */}
                <div className="flex gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex-1 rounded-lg border py-1.5 text-sm transition-colors ${
                        type === t.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">O que estavas a fazer?</label>
                  <textarea
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    rows={2}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 resize-none"
                    placeholder="Ex: Estava a criar um movimento..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">O que deveria acontecer?</label>
                  <textarea
                    value={expected}
                    onChange={e => setExpected(e.target.value)}
                    rows={2}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 resize-none"
                    placeholder="Ex: O movimento devia aparecer na lista..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-500">Descrição <span className="text-zinc-400">(opcional)</span></label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !action.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'A enviar...' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
