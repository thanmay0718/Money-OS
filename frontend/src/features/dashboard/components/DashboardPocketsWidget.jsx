// src/features/dashboard/components/DashboardPocketsWidget.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, ArrowLeftRight, Plus, ChevronRight } from '../../../components/ui/Icons'

export default function DashboardPocketsWidget({
  pockets = [],
  currencyCode = 'INR',
  totalBalance = 0,
}) {
  const navigate = useNavigate()

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  const activePockets = Array.isArray(pockets) ? pockets.slice(0, 4) : []

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C3ABFA]/15 text-[#D5C5FF] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">Money Pockets</h3>
            <p className="text-[11px] text-[#737373]">Allocated liquid reserves &amp; buckets</p>
          </div>
        </div>
        <Link
          to="/pockets"
          className="text-xs text-[#C3ABFA] hover:text-white flex items-center gap-1 font-medium"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Pockets Grid */}
      {activePockets.length === 0 ? (
        <div className="p-6 rounded-2xl border border-white/[0.06] bg-black/20 text-center text-[#737373] text-xs space-y-2">
          <p>No pockets found yet.</p>
          <button
            type="button"
            onClick={() => navigate('/pockets')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Pocket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activePockets.map((pocket) => {
            const balance = Number(pocket.balance ?? pocket.currentBalance ?? 0)
            const share =
              totalBalance > 0 ? Math.min(100, Math.round((balance / totalBalance) * 100)) : 0
            const pocketColor = pocket.color || '#C3ABFA'

            return (
              <div
                key={pocket.id}
                onClick={() => navigate('/pockets')}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: pocketColor, boxShadow: `0 0 6px ${pocketColor}88` }}
                    />
                    <span className="text-xs font-semibold text-[#FAFAFA] truncate max-w-[110px] group-hover:text-white">
                      {pocket.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#737373] px-1.5 py-0.5 rounded bg-white/[0.05]">
                    {share}% share
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-[#FAFAFA] tracking-tight">
                    {formatCurrency(balance)}
                  </div>
                  {/* Micro allocation bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(4, share)}%`,
                        backgroundColor: pocketColor,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[#A3A3A3] border-t border-white/[0.04]">
                  <span>{pocket.type || 'Standard'}</span>
                  <span className="text-[#C3ABFA] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-medium">
                    Manage <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Action Button */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A3A3A3] hover:text-white px-3 py-1.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-all"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-[#86B8F5]" />
          <span>Transfer Between Pockets</span>
        </button>
      </div>
    </div>
  )
}

DashboardPocketsWidget.propTypes = {
  pockets: PropTypes.array,
  currencyCode: PropTypes.string,
  totalBalance: PropTypes.number,
}
