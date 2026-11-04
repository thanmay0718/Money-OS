// src/features/dashboard/components/EmergencyFundWidget.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmergencyFund } from '../dashboardSlice'
import { ShieldCheck, Shield, Sparkles, TrendingUp, ArrowRight } from '../../../components/ui/Icons'

export default function EmergencyFundWidget({ currencyCode = 'INR' }) {
  const dispatch = useDispatch()
  const { emergencyFund, emergencyStatus } = useSelector((state) => state.dashboard)
  const [selectedMonths, setSelectedMonths] = useState(6)

  useEffect(() => {
    dispatch(fetchEmergencyFund(selectedMonths))
  }, [dispatch, selectedMonths])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  const currentSavings = Number(emergencyFund?.currentEmergencySavings) || 0
  const targetAmount = Number(emergencyFund?.recommendedTargetAmount) || 1
  const coverageMonths = Number(emergencyFund?.coverageMonths) || 0
  const progressPct = Math.min(100, Number(emergencyFund?.progressPercentage) || 0)
  const suggestedMonthly = Number(emergencyFund?.suggestedMonthlyContribution) || 0

  const isFullyFunded = progressPct >= 100

  return (
    <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] relative overflow-hidden flex flex-col justify-between space-y-4">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{
          background: isFullyFunded
            ? 'rgba(112, 214, 163, 0.08)'
            : 'rgba(195, 171, 250, 0.08)',
        }}
      />

      {/* Header & Target selector pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C3ABFA]/15 text-[#D5C5FF] flex items-center justify-center">
            {isFullyFunded ? (
              <ShieldCheck className="w-4 h-4 text-[#70D6A3]" />
            ) : (
              <Shield className="w-4 h-4 text-[#C3ABFA]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">
              Emergency Fund Safety Shield
            </h3>
            <p className="text-[11px] text-[#737373]">
              Living expense runway to insulate against unforeseen life events
            </p>
          </div>
        </div>

        {/* Customizable target months toggle */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs self-start sm:self-auto">
          <span className="text-[10px] text-[#737373] px-1.5 hidden md:inline">Target:</span>
          {[3, 6, 9, 12].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMonths(m)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                selectedMonths === m
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-[#737373] hover:text-[#FAFAFA]'
              }`}
            >
              {m} Mo
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider block">
            Secured Reserves
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#FAFAFA] font-mono mt-1 block">
            {formatCurrency(currentSavings)}
          </span>
          <span className="text-[10px] text-[#737373] mt-0.5 block">
            {coverageMonths.toFixed(1)} months covered
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider block">
            {selectedMonths}-Month Target
          </span>
          <span className="text-lg sm:text-xl font-bold text-[#FAFAFA] font-mono mt-1 block">
            {formatCurrency(targetAmount)}
          </span>
          <span className="text-[10px] text-[#737373] mt-0.5 block">
            Avg exp: {formatCurrency(emergencyFund?.averageMonthlyExpenses)}/mo
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider block">
            Pace Recommendation
          </span>
          <span
            className="text-lg sm:text-xl font-bold font-mono mt-1 block"
            style={{ color: isFullyFunded ? '#70D6A3' : '#C3ABFA' }}
          >
            {isFullyFunded ? 'Complete' : formatCurrency(suggestedMonthly)}
          </span>
          <span className="text-[10px] text-[#737373] mt-0.5 block">
            {isFullyFunded ? '100% target reached' : 'Suggested monthly allocation'}
          </span>
        </div>
      </div>

      {/* Progress Bar & Note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
          <span className="text-[11px] font-medium text-[#737373]">
            {emergencyFund?.statusNote || 'Target tracking in progress'}
          </span>
          <span className="font-semibold text-white">{progressPct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(3, progressPct)}%`,
              backgroundColor: isFullyFunded ? '#70D6A3' : '#C3ABFA',
            }}
          />
        </div>
      </div>
    </div>
  )
}

EmergencyFundWidget.propTypes = {
  currencyCode: PropTypes.string,
}
