// src/features/overview/components/StreakCard.jsx
import React, { useEffect, useRef } from 'react'
import { AlertCircle, Flame, Trophy, CalendarCheck, Zap, Check, RefreshCw, TrendingUp } from 'lucide-react'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Mini sparkline bar for the month consistency
const MiniBar = ({ value, max, isToday }) => {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  return (
    <div
      className={`relative flex-1 rounded-sm transition-all duration-300
        ${isToday ? 'opacity-100' : pct > 0 ? 'opacity-80' : 'opacity-25'}`}
      style={{ height: `${Math.max(4, pct * 32)}px` }}
    >
      <div
        className={`absolute bottom-0 inset-x-0 rounded-sm
          ${pct > 0
            ? 'bg-gradient-to-t from-[#C3ABFA] to-[#9F7AEA]'
            : 'bg-white/[0.08]'
          }`}
        style={{ height: '100%' }}
      />
    </div>
  )
}

// Animated streak number
const StreakCounter = ({ value, label, sublabel, accent }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    let start = 0
    const end = Number(value)
    if (end === 0) return
    const duration = 800
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start = Math.min(start + step, end)
      if (ref.current) ref.current.textContent = start
      if (start >= end) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold mb-1">{label}</span>
      <div className={`flex items-baseline gap-1 ${accent || ''}`}>
        <span ref={ref} className="text-3xl font-black tracking-tight tabular-nums text-white/95">{value}</span>
        {sublabel && <span className="text-[11px] text-white/35 font-medium">{sublabel}</span>}
      </div>
    </div>
  )
}

export const StreakCard = ({ streak, loading = false, error, onRetry }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#181818]/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-6 w-24 rounded-full bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-8 w-12 rounded bg-white/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-16 w-full rounded-xl bg-white/[0.04] animate-pulse" />
      </div>
    )
  }

  if (error || !streak) {
    return (
      <div
        role={error ? 'alert' : undefined}
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#181818]/70 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="text-sm font-semibold text-white/90">
              {error ? "Progress data couldn't load" : 'No streak data yet'}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              {error
                ? <>{error} Your goals and account are safe. Try loading progress again.</>
                : 'Record a financial activity to start building your consistency streak.'
              }
            </p>
          </div>
        </div>
        {error && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#C3ABFA]/25 bg-[#C3ABFA]/10 px-3 text-xs font-semibold text-[#D5C5FF] transition-colors hover:bg-[#C3ABFA]/20"
          >
            <RefreshCw aria-hidden="true" size={14} />
            Try again
          </button>
        )}
      </div>
    )
  }

  const {
    currentStreak = 0,
    longestStreak = 0,
    activeDaysThisWeek = 0,
    activeDaysThisMonth = 0,
    weeklyConsistencyPercentage = 0,
    activeToday = false,
    weekDaysActive = [false, false, false, false, false, false, false],
  } = streak

  const isStreakHot = currentStreak >= 3
  const isOnFire = currentStreak >= 7
  const consistencyTier =
    weeklyConsistencyPercentage >= 85 ? 'elite' :
    weeklyConsistencyPercentage >= 60 ? 'solid' :
    weeklyConsistencyPercentage >= 30 ? 'building' : 'starting'

  const tierConfig = {
    elite:    { label: 'Elite', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-400' },
    solid:    { label: 'On Track', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
    building: { label: 'Building', color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
    starting: { label: 'Starting', color: 'text-white/50', bg: 'bg-white/[0.04] border-white/[0.08]', dot: 'bg-white/30' },
  }
  const tier = tierConfig[consistencyTier]

  // Build mini-bar data: map weekDaysActive to 0 or 1
  const barValues = weekDaysActive.map((v) => (v ? 1 : 0))

  return (
    <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-xl transition-all duration-300
      bg-gradient-to-b from-[#131116]/98 via-[#0F0D12]/95 to-[#0A0A0C]/98
      ${isOnFire
        ? 'border-amber-500/25 shadow-[0_0_40px_rgba(245,158,11,0.08)]'
        : isStreakHot
          ? 'border-orange-500/15 shadow-[0_0_24px_rgba(249,115,22,0.05)]'
          : 'border-white/[0.08]'
      } hover:border-opacity-80`}
    >
      {/* Background fire glow for hot streaks */}
      {isStreakHot && (
        <>
          <div
            aria-hidden="true"
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none
              ${isOnFire
                ? 'bg-gradient-to-br from-amber-500/18 via-orange-400/10 to-transparent'
                : 'bg-gradient-to-br from-amber-500/10 via-orange-500/6 to-transparent'
              }`}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-amber-600/8 to-transparent blur-2xl pointer-events-none"
          />
        </>
      )}

      <div className="relative z-[1] p-5 sm:p-6">
        {/* ── Header Row ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Flame icon container */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
              ${isOnFire
                ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/25 border border-amber-400/40 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                : isStreakHot
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/15 border border-amber-500/30'
                  : 'bg-white/[0.05] border border-white/[0.08]'
              }`}
            >
              <Flame
                className={`w-5 h-5 transition-all duration-300
                  ${isOnFire ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' :
                    isStreakHot ? 'text-amber-400' : 'text-white/40'}`}
                fill={isStreakHot ? 'rgba(245,158,11,0.15)' : 'none'}
              />
              {isOnFire && (
                <div className="absolute inset-0 rounded-2xl animate-ping bg-amber-500/10 pointer-events-none" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white/95 tracking-tight">Consistency Streak</h3>
              <p className="text-[11px] text-white/35 mt-0.5">Financial actions recorded daily</p>
            </div>
          </div>

          {/* Active Today badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-300
            ${activeToday
              ? 'bg-emerald-500/12 border-emerald-400/30 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
              : 'bg-white/[0.04] border-white/[0.08] text-white/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0
              ${activeToday
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse'
                : 'bg-white/25'
              }`}
            />
            {activeToday ? 'Active Today' : 'Not Active'}
          </div>
        </div>

        {/* ── Metrics Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.025] border border-white/[0.05] mb-4">
          <StreakCounter value={currentStreak} label="Current Streak" sublabel="days" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-white/35 font-semibold mb-1">Best Streak</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight tabular-nums text-white/95">{longestStreak}</span>
              <span className="text-[11px] text-white/35 font-medium">days</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400 ml-1 mb-0.5" />
            </div>
          </div>
          <StreakCounter value={activeDaysThisWeek} label="This Week" sublabel="/ 7 days" />
          <StreakCounter value={activeDaysThisMonth} label="This Month" sublabel="active" />
        </div>

        {/* ── Weekly Habit Tracker ── */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          {/* Tracker header */}
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
              <CalendarCheck className="w-3.5 h-3.5 text-[#C3ABFA]" />
              Weekly Habit Tracker
            </span>
            {/* Consistency tier badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${tier.bg} ${tier.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
              {tier.label} · {weeklyConsistencyPercentage}%
            </span>
          </div>

          {/* Day pills */}
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {weekDaysActive.map((isActive, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Day circle */}
                <div
                  className={`w-full aspect-square max-w-[38px] rounded-xl flex items-center justify-center transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-br from-[#C3ABFA] to-[#8B5CF6] text-[#0A0A0C] font-bold
                         shadow-[0_2px_12px_rgba(195,171,250,0.4)] scale-105`
                      : 'bg-white/[0.04] text-white/25 border border-white/[0.06]'
                    }`}
                >
                  {isActive
                    ? <Check className="w-3.5 h-3.5 stroke-[3]" />
                    : <span className="text-[10px] font-semibold">{DAY_LABELS[idx]}</span>
                  }
                </div>
                <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">{DAY_LABELS[idx]}</span>
              </div>
            ))}
          </div>

          {/* Mini sparkline bars */}
          <div className="flex items-end gap-0.5 h-8 mt-1 px-0.5">
            {barValues.map((val, idx) => (
              <MiniBar key={idx} value={val} max={1} isToday={false} />
            ))}
          </div>

          {/* Consistency progress bar */}
          <div className="mt-3 pt-3 border-t border-white/[0.05]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Weekly Consistency
              </span>
              <span className="text-[10px] font-bold text-[#C3ABFA]/80 tabular-nums">{weeklyConsistencyPercentage}%</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${weeklyConsistencyPercentage}%`,
                  background: weeklyConsistencyPercentage >= 85
                    ? 'linear-gradient(to right, #F59E0B, #FBBF24)'
                    : weeklyConsistencyPercentage >= 60
                      ? 'linear-gradient(to right, #10B981, #34D399)'
                      : 'linear-gradient(to right, #C3ABFA, #9F7AEA)',
                }}
              />
              {/* Shimmer effect */}
              <div
                className="absolute top-0 h-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: `${weeklyConsistencyPercentage}%`, animation: 'shimmer 2s infinite' }}
              />
            </div>
          </div>
        </div>

        {/* ── Motivational micro-copy for active streaks ── */}
        {isStreakHot && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border
            ${isOnFire
              ? 'bg-amber-500/[0.07] border-amber-500/15 text-amber-300'
              : 'bg-orange-500/[0.05] border-orange-500/10 text-orange-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] font-semibold">
              {isOnFire
                ? `🔥 ${currentStreak}-day fire streak! You're in the top tier of financial discipline.`
                : `Keep it up! ${currentStreak} days strong — ${7 - currentStreak} more to unlock a weekly bonus.`
              }
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StreakCard
