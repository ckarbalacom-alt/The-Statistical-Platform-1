import { ChevronRight, ChevronLeft } from 'lucide-react'
import clsx from 'clsx'

interface PaginationProps {
  currentPage: number
  lastPage: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
        const page = Math.max(1, Math.min(currentPage - 2, lastPage - 4)) + i
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              'w-9 h-9 rounded-lg text-sm font-medium',
              page === currentPage
                ? 'bg-primary text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            )}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  )
}
