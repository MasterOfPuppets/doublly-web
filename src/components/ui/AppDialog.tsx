import { createContext, useContext, useRef, useState, useCallback } from 'react'

interface DialogOptions {
  title?: string
  confirmLabel?: string
  cancelLabel?: string
}

interface DialogState {
  open: boolean
  message: string
  title?: string
  mode: 'alert' | 'confirm'
  confirmLabel: string
  cancelLabel: string
  resolve: (value: boolean) => void
}

interface AppDialogContextValue {
  alert: (message: string, opts?: Pick<DialogOptions, 'title'>) => Promise<void>
  confirm: (message: string, opts?: DialogOptions) => Promise<boolean>
}

const AppDialogContext = createContext<AppDialogContextValue | null>(null)

const INITIAL: DialogState = {
  open: false,
  message: '',
  mode: 'confirm',
  confirmLabel: 'Yes',
  cancelLabel: 'No',
  resolve: () => {},
}

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>(INITIAL)
  const resolveRef = useRef<(v: boolean) => void>(() => {})

  const openDialog = useCallback(
    (mode: 'alert' | 'confirm', message: string, opts: DialogOptions = {}): Promise<boolean> =>
      new Promise((resolve) => {
        resolveRef.current = resolve
        setState({
          open: true,
          message,
          title: opts.title,
          mode,
          confirmLabel: opts.confirmLabel ?? (mode === 'alert' ? 'OK' : 'Yes'),
          cancelLabel: opts.cancelLabel ?? 'No',
          resolve,
        })
      }),
    []
  )

  const alert = useCallback(
    (message: string, opts?: Pick<DialogOptions, 'title'>) => openDialog('alert', message, opts).then(() => {}),
    [openDialog]
  )

  const confirm = useCallback(
    (message: string, opts?: DialogOptions) => openDialog('confirm', message, opts),
    [openDialog]
  )

  function close(value: boolean) {
    setState((s) => ({ ...s, open: false }))
    resolveRef.current(value)
  }

  return (
    <AppDialogContext.Provider value={{ alert, confirm }}>
      {children}

      {state.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl">
            {state.title && (
              <h2 className="mb-2 text-base font-semibold text-gray-900">{state.title}</h2>
            )}
            <p className="text-sm text-gray-600">{state.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              {state.mode === 'confirm' && (
                <button
                  onClick={() => close(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                >
                  {state.cancelLabel}
                </button>
              )}
              <button
                onClick={() => close(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppDialogContext.Provider>
  )
}

export function useAppDialog() {
  const ctx = useContext(AppDialogContext)
  if (!ctx) throw new Error('useAppDialog must be used inside AppDialogProvider')
  return ctx
}
