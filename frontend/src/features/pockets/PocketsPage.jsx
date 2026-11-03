// src/features/pockets/PocketsPage.jsx
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  GlassSurface,
  GlassBadge,
  GlassButton,
} from '../../components/ui/glass'
import { ArrowLeftRight, Wallet } from '../../components/ui/Icons'
import PocketForm from './PocketForm'
import { fetchPockets } from './pocketsSlice'
import { fetchAllTransactions } from '../transactions/transactionsSlice'

export default function PocketsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list: pockets, status: pocketStatus, error: pocketError } = useSelector(
    (state) => state.pockets
  )
  const { list: transactions, status: txStatus } = useSelector(
    (state) => state.transactions
  )
  const user = useSelector((state) => state.auth.user)
  const currencyCode = user?.currency || 'INR'

  useEffect(() => {
    dispatch(fetchPockets())
    if (txStatus === 'idle') {
      dispatch(fetchAllTransactions())
    }
  }, [dispatch, txStatus])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value || 0)
  }

  // Calculate derived balance for each pocket using transaction history
  const getPocketBalance = (pocketId) => {
    if (!transactions || !transactions.length) return 0
    let balance = 0
    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0
      if (tx.toPocketId === pocketId) {
        // Income or incoming transfer
        balance += amt
      }
      if (tx.fromPocketId === pocketId) {
        // Expense or outgoing transfer
        balance -= amt
      }
    }
    return balance
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Money Pockets</h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Allocations of existing capital into designated spending, reserve, and savings pools
          </p>
        </div>
        <GlassButton
          variant="secondary"
          onClick={() => navigate('/transactions')}
          icon={<ArrowLeftRight className="w-4 h-4 text-[#C3ABFA]" />}
        >
          Transfer Between Pockets
        </GlassButton>
      </div>

      {/* Allocation Rule Note */}
      <div className="p-3.5 rounded-2xl glass-subtle border-[#C3ABFA]/20 text-xs text-[#FAFAFA] flex items-center gap-2.5">
        <span className="text-[#C3ABFA]">💡</span>
        <span>
          <strong>Financial rule:</strong> Money pockets represent partitions of your real bank balance. Depositing or transferring into a pocket never creates new money.
        </span>
      </div>

      <PocketForm />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-tight">All Active Pockets</h2>
          <GlassBadge variant="default" size="sm">
            {pockets.length} Configured
          </GlassBadge>
        </div>

        <GlassSurface className="p-0 overflow-hidden">
          {pocketStatus === 'loading' && (!pockets || pockets.length === 0) && (
            <div className="p-8 text-center text-[#A3A3A3] text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin mx-auto mb-2" />
              <p>Loading pockets…</p>
            </div>
          )}

          {pocketStatus === 'failed' && (
            <p className="p-6 text-center text-[#F07891] text-sm">Failed to load: {pocketError}</p>
          )}

          {pocketStatus !== 'loading' && pockets.length > 0 ? (
            <ul className="divide-y divide-[#292929]">
              {pockets.map((pocket) => {
                const balance =
                  pocket.balance != null && Number(pocket.balance) > 0
                    ? Number(pocket.balance)
                    : getPocketBalance(pocket.id)

                return (
                  <li
                    key={pocket.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl glass-subtle border border-[#C3ABFA]/30 flex items-center justify-center text-[#C3ABFA] shadow-sm font-semibold text-sm">
                        <Wallet className="w-5 h-5 text-[#C3ABFA]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#FAFAFA]">{pocket.name}</p>
                        <p className="text-xs text-[#A3A3A3] mt-0.5">
                          Created {new Date(pocket.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-semibold text-base font-mono ${
                          balance > 0
                            ? 'text-[#70D6A3]'
                            : balance < 0
                            ? 'text-[#F07891]'
                            : 'text-[#FAFAFA]'
                        }`}
                      >
                        {formatCurrency(balance)}
                      </span>
                      <p className="text-[10px] text-[#A3A3A3] font-medium tracking-wide uppercase mt-0.5">
                        {balance >= 0 ? 'Available' : 'Overdrawn'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : pocketStatus !== 'loading' ? (
            <div className="p-8 text-center text-[#A3A3A3]">
              <p className="text-sm font-medium text-[#FAFAFA]">No pockets configured yet</p>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Create your first pocket using the form above.
              </p>
            </div>
          ) : null}
        </GlassSurface>
      </section>
    </div>
  )
}
