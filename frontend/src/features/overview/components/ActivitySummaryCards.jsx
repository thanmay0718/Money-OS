// src/features/overview/components/ActivitySummaryCards.jsx
import React from 'react'
import PropTypes from 'prop-types'
import {
  Activity,
  CalendarDays,
  Target,
  TrendingUp,
  TrendingDown,
  Info,
} from '../../../components/ui/Icons'
import { formatINR } from '../../../lib/format'

export default function ActivitySummaryCards({
  summary,
  isLoading,
  onCardClick,
}) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-[#181818]/70 animate-pulse min-h-[120px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/5" />
              <div className="w-12 h-4 rounded bg-white/5" />
            </div>
            <div>
              <div className="w-20 h-7 rounded bg-white/5 mb-1.5" />
              <div className="w-28 h-3 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const {
    totalActivities = 0,
    activeDays = 0,
    currentStreak = 0,
    longestStreak = 0,
    monthlySavings = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    previousPeriodActivities = 0,
    previousPeriodActiveDays = 0,
  } = summary

  const savingsNum = Number(monthlySavings || 0)
  const isPositiveSavings = savingsNum >= 0

  // Calculate comparisons if previous data exists
  const activityDiff = totalActivities - previousPeriodActivities
  const activeDaysDiff = activeDays - previousPeriodActiveDays

  const cards = [
    {
      id: 'total-activities',
      title: 'Total Activities',
      value: Number(totalActivities).toLocaleString('en-IN'),
      unit: 'actions',
      subtitle: activityDiff >= 0 ? `+${activityDiff} vs prior period` : `${activityDiff} vs prior period`,
      tooltip: 'Meaningful financial actions (transactions, goal contributions, budgets, pockets).',
      icon: <Activity className="w-4 h-4 text-[#C3ABFA]" />,
      iconBg: 'bg-[#C3ABFA]/15 border-[#C3ABFA]/30',
      accentColor: 'text-[#C3ABFA]',
    },
    {
      id: 'active-days',
      title: 'Active Days',
      value: activeDays,
      unit: 'calendar days',
      subtitle: activeDaysDiff >= 0 ? `+${activeDaysDiff} days vs prior period` : `${activeDaysDiff} days vs prior period`,
      tooltip: 'Unique dates where you recorded transactions, contributed to goals, or managed money.',
      icon: <CalendarDays className="w-4 h-4 text-[#86B8F5]" />,
      iconBg: 'bg-[#86B8F5]/15 border-[#86B8F5]/30',
      accentColor: 'text-[#86B8F5]',
    },
    {
      id: 'current-streak',
      title: 'Current Streak',
      value: currentStreak,
      unit: currentStreak === 1 ? 'day' : 'consecutive days',
      subtitle: `Personal best: ${longestStreak} days`,
      tooltip: 'Consecutive days with at least one eligible financial action. Today or yesterday keeps streak alive.',
      icon: <Target className="w-4 h-4 text-[#E9BC68]" />,
      iconBg: 'bg-[#E9BC68]/15 border-[#E9BC68]/30',
      accentColor: 'text-[#E9BC68]',
    },
    {
      id: 'net-savings',
      title: 'Net Savings',
      value: formatINR(savingsNum),
      unit: isPositiveSavings ? 'net retained' : 'net deficit',
      subtitle: `Income ${formatINR(Number(monthlyIncome || 0))} · Exp ${formatINR(Number(monthlyExpenses || 0))}`,
      tooltip: 'Actual net savings: Total Income minus Total Expenses (transfers strictly excluded).',
      icon: isPositiveSavings ? (
        <TrendingUp className="w-4 h-4 text-[#70D6A3]" />
      ) : (
        <TrendingDown className="w-4 h-4 text-[#F07891]" />
      ),
      iconBg: isPositiveSavings
        ? 'bg-[#70D6A3]/15 border-[#70D6A3]/30'
        : 'bg-[#F07891]/15 border-[#F07891]/30',
      accentColor: isPositiveSavings ? 'text-[#70D6A3]' : 'text-[#F07891]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick?.(card.id)}
          className="group relative p-4 sm:p-5 rounded-2xl border border-white/5 bg-[#181818]/80 hover:bg-[#1a1a1f] hover:border-[#C3ABFA]/30 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-200 cursor-pointer flex flex-col justify-between select-none"
        >
          {/* Card Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2 rounded-xl border ${card.iconBg} transition-transform group-hover:scale-105`}
            >
              {card.icon}
            </div>
            <div className="relative group/tip" title={card.tooltip}>
              <Info className="w-3.5 h-3.5 text-[#737373] hover:text-[#FAFAFA] transition-colors" />
            </div>
          </div>

          {/* Card Value & Details */}
          <div>
            <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wider mb-1">
              {card.title}
            </p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={`text-xl sm:text-2xl font-bold tracking-tight ${card.accentColor} tabular-nums`}
              >
                {card.value}
              </span>
              <span className="text-xs text-[#737373]">{card.unit}</span>
            </div>
            <p className="text-[11px] text-[#A3A3A3] truncate mt-1">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

ActivitySummaryCards.propTypes = {
  summary: PropTypes.object,
  isLoading: PropTypes.bool,
  onCardClick: PropTypes.func,
}
