// src/features/dashboard/components/RecentTransactionsTable.jsx
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  CalendarDays,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  X,
  TriangleAlert,
} from '../../../components/ui/Icons'
import { deleteTransaction } from '../../transactions/transactionsSlice'
import { fetchDashboardSummary } from '../dashboardSlice'
import { fetchPockets } from '../../pockets/pocketsSlice'
import { toast } from '../../../lib/toast'

export default function RecentTransactionsTable({
  transactions = [],
  currencyCode = 'INR',
  categories = [],
  filterCategory = null,
  onClearCategoryFilter,
}) {
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL') // 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'
  const [dateFilter, setDateFilter] = useState('ALL') // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [page, setPage] = useState(0)
  const pageSize = 7

  // Deletion state
  const [deletingTx, setDeletingTx] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(val || 0)

  // Filter transactions
  const filteredList = useMemo(() => {
    if (!Array.isArray(transactions)) return []

    const now = new Date()

    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false

      // Category filter (either external from Donut click or internal)
      if (filterCategory) {
        const catName = tx.categoryName || tx.category?.name || ''
        if (catName.toLowerCase() !== filterCategory.toLowerCase()) return false
      }

      // Date filter
      if (dateFilter !== 'ALL' && tx.transactionDate) {
        const txDate = new Date(tx.transactionDate)
        if (dateFilter === 'TODAY') {
          if (txDate.toDateString() !== now.toDateString()) return false
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (txDate < sevenDaysAgo) return false
        } else if (dateFilter === 'MONTH') {
          if (
            txDate.getMonth() !== now.getMonth() ||
            txDate.getFullYear() !== now.getFullYear()
          ) {
            return false
          }
        }
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const desc = (tx.description || '').toLowerCase()
        const cat = (tx.categoryName || tx.category?.name || '').toLowerCase()
        const pocket = (tx.fromPocketName || tx.pocketName || '').toLowerCase()
        return desc.includes(term) || cat.includes(term) || pocket.includes(term)
      }

      return true
    })
  }, [transactions, typeFilter, dateFilter, filterCategory, searchTerm])

  const totalPages = Math.ceil(filteredList.length / pageSize)
  const paginatedList = filteredList.slice(page * pageSize, (page + 1) * pageSize)

  const handleDelete = async () => {
    if (!deletingTx) return
    setIsDeleting(true)
    try {
      await dispatch(deleteTransaction(deletingTx.id)).unwrap()
      // Refresh summaries and pockets so balances stay consistent
      dispatch(fetchDashboardSummary())
      dispatch(fetchPockets())
      toast.success('Transaction removed', 'Pocket balance updated atomically.')
      setDeletingTx(null)
    } catch (err) {
      toast.error('Deletion failed', err || 'Could not delete transaction.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Header controls: Search, Type filter, Date filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder="Search transactions, notes, pockets..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-white/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Category Tag if selected from Donut */}
          {filterCategory && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#C3ABFA]/20 text-[#D5C5FF] border border-[#C3ABFA]/30">
              <span>Category: {filterCategory}</span>
              <button
                type="button"
                onClick={onClearCategoryFilter}
                className="hover:text-white"
                title="Clear category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Type filter */}
          <div className="flex items-center rounded-xl bg-white/[0.04] p-0.5 border border-white/[0.06] text-xs">
            {['ALL', 'INCOME', 'EXPENSE', 'TRANSFER'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTypeFilter(t)
                  setPage(0)
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === t
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#737373] hover:text-[#FAFAFA]'
                }`}
              >
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <div className="flex items-center rounded-xl bg-white/[0.04] p-0.5 border border-white/[0.06] text-xs">
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'WEEK', label: '7 Days' },
              { id: 'MONTH', label: 'Month' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDateFilter(d.id)
                  setPage(0)
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  dateFilter === d.id
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#737373] hover:text-[#FAFAFA]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-black/20">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#737373] text-[11px] font-medium bg-white/[0.02]">
              <th className="py-2.5 px-4">Transaction</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Pocket</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#737373] text-xs">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedList.map((tx) => {
                const isIncome = tx.type === 'INCOME'
                const isExpense = tx.type === 'EXPENSE'
                const isTransfer = tx.type === 'TRANSFER'
                const dateStr = tx.transactionDate
                  ? new Date(tx.transactionDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-[#70D6A3]/15 text-[#70D6A3]'
                              : isExpense
                              ? 'bg-[#F07891]/15 text-[#F07891]'
                              : 'bg-[#86B8F5]/15 text-[#86B8F5]'
                          }`}
                        >
                          {isIncome && <TrendingUp className="w-3.5 h-3.5" />}
                          {isExpense && <TrendingDown className="w-3.5 h-3.5" />}
                          {isTransfer && <ArrowLeftRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#FAFAFA] truncate max-w-[180px] sm:max-w-[240px]">
                            {tx.description || (isTransfer ? 'Pocket Transfer' : 'Transaction')}
                          </p>
                          {tx.notes && (
                            <p className="text-[10px] text-[#737373] truncate max-w-[200px]">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-[#A3A3A3]">
                        {tx.categoryName || tx.category?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#A3A3A3] text-[11px] whitespace-nowrap">
                      {dateStr}
                    </td>

                    <td className="py-2.5 px-3 text-[#A3A3A3] text-[11px]">
                      {isTransfer
                        ? `${tx.fromPocketName || 'Pocket'} → ${tx.toPocketName || 'Pocket'}`
                        : tx.pocketName || tx.fromPocketName || 'Main Pocket'}
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-[#70D6A3]'
                            : isExpense
                            ? 'text-[#F07891]'
                            : 'text-[#86B8F5]'
                        }
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setDeletingTx(tx)}
                        title="Delete transaction"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#737373] hover:text-[#F07891] hover:bg-[#F07891]/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-[#737373] pt-1">
        <span>
          Showing {filteredList.length === 0 ? 0 : page * pageSize + 1}–
          {Math.min((page + 1) * pageSize, filteredList.length)} of {filteredList.length}
        </span>
        <div className="flex items-center gap-2">
          <Link
            to="/transactions"
            className="text-xs text-[#C3ABFA] hover:underline mr-2"
          >
            View All in Transactions →
          </Link>
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-1 rounded-lg border border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px]">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-1 rounded-lg border border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06]"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl p-5 border border-white/10 bg-[#161616] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#F07891]">
              <div className="w-9 h-9 rounded-xl bg-[#F07891]/15 flex items-center justify-center shrink-0">
                <TriangleAlert className="w-5 h-5 text-[#F07891]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#FAFAFA]">Delete Transaction</h4>
                <p className="text-[11px] text-[#737373]">
                  This action will atomically restore pocket balances.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#737373]">Description</span>
                <span className="font-medium text-[#FAFAFA]">{deletingTx.description || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Amount</span>
                <span className="font-semibold text-[#FAFAFA]">{formatCurrency(deletingTx.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingTx(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-white hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F07891] text-black hover:bg-[#F07891]/90 shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

RecentTransactionsTable.propTypes = {
  transactions: PropTypes.array,
  currencyCode: PropTypes.string,
  categories: PropTypes.array,
  filterCategory: PropTypes.string,
  onClearCategoryFilter: PropTypes.func,
}
