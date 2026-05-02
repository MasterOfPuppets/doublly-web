import { useEffect, useRef, useState } from 'react'
import type { AccountDto } from '../../types'
import { formatCurrencyEUR } from '../../lib/currency'

interface Props {
  project: AccountDto
  onOpen: (id: string) => void
  onEdit: (id: string) => void
}

export function ProjectCard({ project, onOpen, onEdit }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    setMenuOpen(false)
    onOpen(project.id)
  }

  function handleEdit() {
    setMenuOpen(false)
    onEdit(project.id)
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md">
      <button
        type="button"
        onClick={handleOpen}
        className="w-full pr-12 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600">
              {project.name}
            </h3>
            {project.referenceValue > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Budget:{' '}
                <span className="font-medium text-gray-700">
                  {formatCurrencyEUR(project.referenceValue)}
                </span>
              </p>
            )}
          </div>
          <span className="text-gray-300 group-hover:text-indigo-400">→</span>
        </div>
      </button>

      <div className="absolute right-4 top-4" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-md px-2 py-1 text-base font-bold leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Project actions for ${project.name}`}
        >
          ···
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleOpen}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Open
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed px-4 py-2 text-left text-sm text-gray-300"
            >
              Export
            </button>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed px-4 py-2 text-left text-sm text-gray-300"
            >
              Share
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed px-4 py-2 text-left text-sm text-gray-300"
            >
              Archive
            </button>
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed px-4 py-2 text-left text-sm text-gray-300"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
