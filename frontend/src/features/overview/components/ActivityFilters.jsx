// src/features/overview/components/ActivityFilters.jsx
import React from 'react'
import PropTypes from 'prop-types'
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  CalendarDays,
} from '../../../components/ui/Icons'

const FILTER_PILLS = [
  { label: 'All Activities', value: null },
  { label: 'Income', value: ['TRANSACTION_INCOME'] },
  { label: 'Expenses', value: ['TRANSACTION_EXPENSE'] },
  { label: 'Transfers', value: ['TRANSACTION_TRANSFER'] },
  {
    label: 'Goals',
    value: ['GOAL_CREATED', 'GOAL_CONTRIBUTION', 'GOAL_COMPLETED', 'GOAL_UPDATED'],
  },
  { label: 'Pockets', value: ['POCKET_CREATED', 'POCKET_UPDATED'] },
  { label: 'Budgets', value: ['BUDGET_CREATED', 'BUDGET_UPDATED'] },
]

export default function ActivityFilters({
  activeTypes,
  onTypeChange,
  searchQuery,
  onSearchChange,
  selectedDate,
  onClearDate,
  sortOrder,
  onToggleSort,
}) {
  return (
    <div className="space-y-3 mb-5">
      {/* Top filter row: Search bar + Selected Date pill + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search activities by description or title..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-white/[0.03] border border-white/10 text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-[#C3ABFA]/50 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#FAFAFA]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Date Filter Tag */}
          {selectedDate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C3ABFA]/15 border border-[#C3ABFA]/35 text-xs text-[#FAFAFA] animate-in fade-in">
              <CalendarDays className="w-3.5 h-3.5 text-[#C3ABFA]" />
              <span className="font-medium text-[#C3ABFA]">Day:</span>
              <span>{selectedDate}</span>
              <button
                type="button"
                onClick={onClearDate}
                className="ml-1 p-0.5 rounded-full hover:bg-white/10 text-[#A3A3A3] hover:text-white"
                title="Clear selected date"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sort order toggle */}
          <button
            type="button"
            onClick={onToggleSort}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#C3ABFA]" />
            <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_PILLS.map((pill) => {
          const isSelected =
            (pill.value === null && (!activeTypes || activeTypes.length === 0)) ||
            (pill.value !== null &&
              activeTypes &&
              JSON.stringify(pill.value) === JSON.stringify(activeTypes))

          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onTypeChange(pill.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#C3ABFA]/20 border border-[#C3ABFA]/50 text-[#FAFAFA] shadow-[0_0_12px_rgba(195,171,250,0.25)]'
                  : 'bg-white/[0.03] border border-white/5 text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06]'
              }`}
            >
              {pill.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

ActivityFilters.propTypes = {
  activeTypes: PropTypes.array,
  onTypeChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  selectedDate: PropTypes.string,
  onClearDate: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onToggleSort: PropTypes.func.isRequired,
}
