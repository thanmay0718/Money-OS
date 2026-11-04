// src/features/overview/components/OverviewHeader.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { Activity, RefreshCw } from '../../../components/ui/Icons'

const PERIOD_OPTIONS = [
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Last 6 Months', value: 'last6months' },
  { label: 'Last 12 Months', value: 'last12months' },
]

export default function OverviewHeader({
  dateRange,
  onPeriodChange,
  onRefresh,
  isRefreshing,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 rounded-lg bg-[#C3ABFA]/15 border border-[#C3ABFA]/30">
            <Activity className="w-4 h-4 text-[#C3ABFA]" />
          </div>
          <span className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
            Personal Progress Center
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight">
          Your Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
          Track your financial journey, streaks and habits over time.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Period Selector Tabs */}
        <div className="inline-flex rounded-xl border border-white/10 bg-[#161616]/80 p-1">
          {PERIOD_OPTIONS.map((opt) => {
            const active = dateRange === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPeriodChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  active
                    ? 'bg-[#C3ABFA] text-[#101010] shadow-[0_2px_10px_rgba(195,171,250,0.35)]'
                    : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Overview"
          className="p-2 rounded-xl border border-white/10 bg-[#161616]/80 text-[#A3A3A3] hover:text-[#FAFAFA] hover:border-white/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C3ABFA]' : ''}`} />
        </button>
      </div>
    </div>
  )
}

OverviewHeader.propTypes = {
  dateRange: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
}
