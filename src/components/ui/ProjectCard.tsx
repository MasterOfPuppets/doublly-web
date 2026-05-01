import type { AccountDto } from '../../types'
import { formatCurrencyEUR } from '../../lib/currency'

interface Props {
  project: AccountDto
  onClick: (id: string) => void
}

export function ProjectCard({ project, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(project.id)}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
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
  )
}
