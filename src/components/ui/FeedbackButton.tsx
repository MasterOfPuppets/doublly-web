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
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-sky-700"
        title="Enviar feedback"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {done ? (
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-emerald-700">Obrigado pelo feedback! 🙏</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Enviar feedback</h2>
                  <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
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
                          ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">O que estavas a fazer?</label>
                  <textarea
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    rows={2}
                    className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Ex: Estava a criar um movimento..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">O que deveria acontecer?</label>
                  <textarea
                    value={expected}
                    onChange={e => setExpected(e.target.value)}
                    rows={2}
                    className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Ex: O movimento devia aparecer na lista..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600">Descrição <span className="text-slate-400">(opcional)</span></label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !action.trim()}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
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
