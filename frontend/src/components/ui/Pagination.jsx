// src/components/ui/Pagination.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems === 0)) return null

  const getPageNumbers = () => {
    const pages = []
    const delta = 1 // how many neighbors around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5 text-xs ${className}`}
    >
      {/* Left Item Summary */}
      {totalItems != null && (
        <span className="text-[#737373] text-[11px] font-medium">
          Showing{' '}
          <strong className="text-[#FAFAFA] font-semibold">
            {startItem}–{endItem}
          </strong>{' '}
          of <strong className="text-[#FAFAFA] font-semibold">{totalItems}</strong> entries
        </span>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto ml-auto">
        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="flex items-center justify-center size-8 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Pills */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-white/30 text-xs">
                …
              </span>
            )
          }

          const isActive = p === currentPage
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#C3ABFA] text-[#0A0A0C] shadow-[0_2px_10px_rgba(195,171,250,0.3)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {p}
            </button>
          )
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="flex items-center justify-center size-8 rounded-lg border border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}

export default Pagination
