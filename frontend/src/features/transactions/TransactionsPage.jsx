// src/features/transactions/TransactionsPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllTransactions } from './transactionsSlice'
import TransactionForm from './TransactionForm'
import {
  GlassSurface,
  GlassBadge,
  GlassSegmentedControl,
} from '../../components/ui/glass'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ReceiptIcon,
} from '../../components/ui/Icons'

export default function TransactionsPage() {
  const dispatch = useDispatch()
  const { list: transactions, status, error } = useSelector((state) => state.transactions)
  const user = useSelector((state) => state.auth.user)
  const currencyCode = user?.currency || 'INR'

  const [filterType, setFilterType] = useState('ALL')

  useEffect(() => {
    dispatch(fetchAllTransactions())
  }, [dispatch])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value || 0)
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'ALL') return true
    return tx.type === filterType
  })

  const filterOptions = [
    { value: 'ALL', label: 'All Transactions' },
    { value: 'INCOME', label: 'Income' },
    { value: 'EXPENSE', label: 'Expenses' },
    { value: 'TRANSFER', label: 'Transfers' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
          Transactions
        </h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
          Detailed ledger of verified income, day-to-day expenditures, and money pocket reallocations
        </p>
      </div>

      <TransactionForm />

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <GlassSegmentedControl
            options={filterOptions}
            value={filterType}
            onChange={setFilterType}
            size="md"
          />
          <span className="text-xs text-[#737373] font-medium">
            Showing {filteredTransactions.length} of {transactions.length} entries
          </span>
        </div>

        <GlassSurface className="p-0 overflow-hidden border-[#292929] bg-[#181818]/90">
          {status === 'loading' && (!transactions || transactions.length === 0) && (
            <div className="p-10 text-center text-[#A3A3A3] text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin mx-auto mb-2" />
              <p>Loading transactions ledger…</p>
            </div>
          )}

          {status === 'failed' && (
            <p className="p-6 text-center text-[#F07891] text-sm">Failed to load transactions: {error}</p>
          )}

          {status !== 'loading' && filteredTransactions.length > 0 ? (
            <ul className="divide-y divide-[#292929] max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'INCOME'
                const isExpense = tx.type === 'EXPENSE'
                const isTransfer = tx.type === 'TRANSFER'

                return (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-sm ${
                          isIncome
                            ? 'bg-[#70D6A3]/15 border-[#70D6A3]/30 text-[#70D6A3]'
                            : isExpense
                            ? 'bg-[#F07891]/15 border-[#F07891]/30 text-[#F07891]'
                            : 'bg-[#86B8F5]/15 border-[#86B8F5]/30 text-[#86B8F5]'
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : isExpense ? (
                          <TrendingDown className="w-5 h-5" />
                        ) : (
                          <ArrowLeftRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#FAFAFA]">
                            {tx.description || 'Untitled Transaction'}
                          </span>
                          {tx.categoryName && (
                            <GlassBadge variant="default" size="sm">
                              {tx.categoryName}
                            </GlassBadge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#737373]">
                          <span>
                            {new Date(tx.transactionDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {isTransfer && tx.fromPocketName && tx.toPocketName && (
                            <span>
                              • {tx.fromPocketName} &rarr; {tx.toPocketName}
                            </span>
                          )}
                          {!isTransfer && tx.toPocketName && (
                            <span>• Deposited into {tx.toPocketName}</span>
                          )}
                          {!isTransfer && tx.fromPocketName && (
                            <span>• Paid from {tx.fromPocketName}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-semibold text-base font-mono ${
                          isIncome
                            ? 'text-[#70D6A3]'
                            : isExpense
                            ? 'text-[#F07891]'
                            : 'text-[#86B8F5]'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      <p className="text-[10px] text-[#737373] font-semibold tracking-wider uppercase mt-0.5">
                        {tx.type}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : status !== 'loading' ? (
            <div className="p-12 text-center text-[#A3A3A3]">
              <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#292929] flex items-center justify-center mx-auto mb-3 text-[#C3ABFA]">
                <ReceiptIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#FAFAFA]">
                {filterType === 'ALL'
                  ? 'No transactions yet'
                  : `No ${filterOptions.find((f) => f.value === filterType)?.label.toLowerCase()} recorded`}
              </p>
              <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
                Add your first transaction above to start tracking your income, expenses, and cash flow.
              </p>
            </div>
          ) : null}
        </GlassSurface>
      </section>
    </div>
  )
}
