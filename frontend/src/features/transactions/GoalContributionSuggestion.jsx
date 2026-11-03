// src/features/transactions/GoalContributionSuggestion.jsx
import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { fetchGoals } from '../../api/goals'
import { GlassSurface, GlassBadge, GlassButton } from '../../components/ui/glass'
import { Sparkles, Target, Check, Info } from '../../components/ui/Icons'

/**
 * GoalContributionSuggestion provides a contextual Liquid Glass interface
 * encouraging users to "Put your money to work" when recording new income.
 * Strictly adheres to financial integrity rules.
 */
export default function GoalContributionSuggestion({
  incomeAmount,
  currency = 'INR',
  value, // { goalId, amount, note } | null
  onChange,
}) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selectedGoalId, setSelectedGoalId] = useState(value?.goalId || null)
  const [contributionAmount, setContributionAmount] = useState(
    value?.amount ? String(value.amount) : ''
  )
  const [contributionNote, setContributionNote] = useState(value?.note || '')
  const [isCustomAmount, setIsCustomAmount] = useState(false)

  // Fetch active goals on mount
  useEffect(() => {
    let isMounted = true
    const loadActiveGoals = async () => {
      try {
        setLoading(true)
        setLoadError(null)
        const response = await fetchGoals()
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.content || []

        if (isMounted) {
          // Filter out completed / archived goals
          const activeGoals = data.filter((g) => {
            const isCompleted =
              g.status === 'COMPLETED' || g.status === 'OVERACHIEVED'
            const remaining =
              g.remainingAmount != null
                ? Number(g.remainingAmount)
                : Number(g.targetAmount) - Number(g.savedAmount)
            return !isCompleted && remaining > 0
          })
          setGoals(activeGoals)
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Could not load goals for income contribution suggestion:', err)
          setLoadError('Unable to load goals right now. You can still record income.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadActiveGoals()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync internal state when controlled value resets from outside
  useEffect(() => {
    if (!value || !value.goalId) {
      setSelectedGoalId(null)
      setContributionAmount('')
      setContributionNote('')
      setIsCustomAmount(false)
    }
  }, [value])

  const parsedIncome = parseFloat(incomeAmount) || 0
  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId) || null,
    [goals, selectedGoalId]
  )

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  // Calculate smart presets based on income and remaining amount
  const presetSuggestions = useMemo(() => {
    if (!selectedGoal) return []

    const remaining =
      selectedGoal.remainingAmount != null
        ? Number(selectedGoal.remainingAmount)
        : Math.max(0, Number(selectedGoal.targetAmount) - Number(selectedGoal.savedAmount))

    const maxAllocatable = parsedIncome > 0 ? Math.min(parsedIncome, remaining) : remaining

    const candidates = []

    if (parsedIncome > 0) {
      const p10 = Math.round(parsedIncome * 0.1)
      const p25 = Math.round(parsedIncome * 0.25)
      const p50 = Math.round(parsedIncome * 0.5)

      if (p10 > 0 && p10 <= maxAllocatable) {
        candidates.push({ label: `10% (${formatCurrency(p10)})`, value: p10 })
      }
      if (p25 > 0 && p25 <= maxAllocatable && p25 !== p10) {
        candidates.push({ label: `25% (${formatCurrency(p25)})`, value: p25 })
      }
      if (p50 > 0 && p50 <= maxAllocatable && p50 !== p25 && p50 !== p10) {
        candidates.push({ label: `50% (${formatCurrency(p50)})`, value: p50 })
      }
    }

    // Standard round numbers (e.g., ₹2,000, ₹5,000, ₹10,000)
    const fixedAmounts = [1000, 2000, 5000, 10000, 25000]
    for (const fa of fixedAmounts) {
      if (
        fa <= maxAllocatable &&
        !candidates.some((c) => Math.abs(c.value - fa) < 10)
      ) {
        candidates.push({ label: formatCurrency(fa), value: fa })
      }
    }

    return candidates.slice(0, 4)
  }, [selectedGoal, parsedIncome, currency])

  // Propagate changes to parent
  const notifyChange = (goalId, amountStr, noteStr) => {
    if (!goalId) {
      onChange(null)
      return
    }
    const numAmt = parseFloat(amountStr)
    if (isNaN(numAmt) || numAmt <= 0) {
      onChange({ goalId, amount: '', note: noteStr, isValid: false })
    } else {
      onChange({
        goalId,
        amount: numAmt,
        note: noteStr,
        isValid: parsedIncome > 0 ? numAmt <= parsedIncome : true,
      })
    }
  }

  const handleSelectGoal = (goal) => {
    if (selectedGoalId === goal.id) {
      handleSkip()
      return
    }

    setSelectedGoalId(goal.id)
    setIsCustomAmount(false)

    const remaining =
      goal.remainingAmount != null
        ? Number(goal.remainingAmount)
        : Math.max(0, Number(goal.targetAmount) - Number(goal.savedAmount))

    let defaultAmt = 0
    if (parsedIncome > 0) {
      const suggested20 = Math.round(parsedIncome * 0.2)
      defaultAmt = Math.min(suggested20 > 0 ? suggested20 : parsedIncome, remaining)
    } else {
      defaultAmt = Math.min(5000, remaining)
    }

    const defaultStr = defaultAmt > 0 ? String(defaultAmt) : ''
    setContributionAmount(defaultStr)
    notifyChange(goal.id, defaultStr, contributionNote)
  }

  const handlePresetClick = (val) => {
    setIsCustomAmount(false)
    const strVal = String(val)
    setContributionAmount(strVal)
    notifyChange(selectedGoalId, strVal, contributionNote)
  }

  const handleCustomAmountChange = (e) => {
    const val = e.target.value
    setContributionAmount(val)
    notifyChange(selectedGoalId, val, contributionNote)
  }

  const handleNoteChange = (e) => {
    const val = e.target.value
    setContributionNote(val)
    notifyChange(selectedGoalId, contributionAmount, val)
  }

  const handleSkip = () => {
    setSelectedGoalId(null)
    setContributionAmount('')
    setContributionNote('')
    setIsCustomAmount(false)
    notifyChange(null, '', '')
  }

  const numContribution = parseFloat(contributionAmount) || 0
  const isOverIncome = parsedIncome > 0 && numContribution > parsedIncome
  const currentSaved = selectedGoal ? Number(selectedGoal.savedAmount) || 0 : 0
  const target = selectedGoal ? Number(selectedGoal.targetAmount) || 0 : 0
  const newSaved = currentSaved + numContribution
  const newRemaining = Math.max(0, target - newSaved)
  const currentProgress = target > 0 ? (currentSaved / target) * 100 : 0
  const newProgress = target > 0 ? Math.min(100, (newSaved / target) * 100) : 0
  const addedProgressPercent = Math.max(0, newProgress - currentProgress)

  const unallocatedAmount = Math.max(0, parsedIncome - numContribution)

  if (loadError) {
    return (
      <div className="rounded-2xl glass-subtle border border-[#292929] p-3.5 text-xs text-[#A3A3A3] flex items-center justify-between">
        <span>{loadError}</span>
        <button
          type="button"
          onClick={() => setLoadError(null)}
          className="text-[#A3A3A3] hover:text-[#FAFAFA] px-2 py-0.5 text-xs transition-colors"
        >
          Dismiss
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl glass-panel p-5 animate-pulse">
        <div className="h-4 w-48 bg-[#222222] rounded-lg mb-2" />
        <div className="h-3 w-64 bg-[#222222]/60 rounded-lg" />
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="rounded-2xl glass-subtle border border-[#292929] p-4 text-xs text-[#A3A3A3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#C3ABFA]" />
          <span>No active financial goals yet. Create one in Goals to allocate income automatically!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl glass-panel border border-[#C3ABFA]/30 bg-[#181818]/90 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl transition-all duration-300 overflow-hidden">
      {/* Background Specular Flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C3ABFA]/15 via-[#8E6BE8]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C3ABFA]/30 to-[#8E6BE8]/40 border border-[#C3ABFA]/40 flex items-center justify-center text-[#C3ABFA] shadow-[0_0_15px_rgba(195,171,250,0.3)]">
            <Sparkles className="w-4 h-4 text-[#C3ABFA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">
                Put your money to work
              </h3>
              <GlassBadge variant="accent" size="sm">
                Optional
              </GlassBadge>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Instantly allocate a portion of this incoming deposit toward a target goal.
            </p>
          </div>
        </div>

        {selectedGoalId && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors flex items-center gap-1 px-2.5 py-1 rounded-lg glass-pill"
            title="Deselect goal contribution"
          >
            <span>Skip for now</span>
            <span className="text-sm font-bold">&times;</span>
          </button>
        )}
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-3 relative z-10">
        {goals.map((g) => {
          const isSelected = g.id === selectedGoalId
          const saved = Number(g.savedAmount) || 0
          const tgt = Number(g.targetAmount) || 0
          const remaining =
            g.remainingAmount != null ? Number(g.remainingAmount) : Math.max(0, tgt - saved)
          const pct = tgt > 0 ? (saved / tgt) * 100 : 0

          return (
            <div
              key={g.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectGoal(g)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectGoal(g)
                }
              }}
              className={`group relative rounded-xl p-3.5 text-left transition-all duration-200 cursor-pointer focus:outline-none ${
                isSelected
                  ? 'border-2 border-[#C3ABFA] bg-gradient-to-br from-[#C3ABFA]/25 via-[#8E6BE8]/20 to-[#181818] shadow-[0_4px_20px_rgba(195,171,250,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-[#C3ABFA]/50'
                  : 'glass-subtle border border-[#292929] hover:border-[#C3ABFA]/40 hover:bg-[#222222]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-1.5 truncate">
                  <Target className="w-3.5 h-3.5 text-[#C3ABFA]" />
                  <span
                    className={`text-xs font-semibold truncate ${
                      isSelected ? 'text-[#FAFAFA]' : 'text-[#FAFAFA] group-hover:text-[#C3ABFA]'
                    }`}
                  >
                    {g.title}
                  </span>
                </div>
                {isSelected ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#C3ABFA] text-[10px] text-[#18151F] shadow-sm">
                    &#10003;
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-[#A3A3A3]">
                    {pct.toFixed(0)}%
                  </span>
                )}
              </div>

              {/* Progress mini-bar */}
              <div className="w-full h-1.5 rounded-full bg-[#101010] overflow-hidden my-2 border border-[#292929]">
                <div
                  className="h-full bg-gradient-to-r from-[#C3ABFA] to-[#D5C5FF] transition-all duration-300"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              {/* Financial Metrics */}
              <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] mt-1">
                <span>
                  Saved: <strong className="text-[#FAFAFA] font-mono">{formatCurrency(saved)}</strong>
                </span>
                <span>
                  Target: <strong className="text-[#A3A3A3] font-mono">{formatCurrency(tgt)}</strong>
                </span>
              </div>

              <div className="text-[11px] text-[#A3A3A3] mt-1 flex justify-between items-center">
                <span>Remaining:</span>
                <span className="text-[#70D6A3] font-medium font-mono">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded Goal Contribution Config when a goal is selected */}
      {selectedGoal && (
        <div className="mt-4 pt-4 border-t border-[#292929] space-y-3 relative z-10 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#FAFAFA]">
              Select contribution amount:
            </span>
            {parsedIncome > 0 && (
              <span className="text-[11px] text-[#A3A3A3]">
                Max allocatable: <strong className="text-[#FAFAFA] font-mono">{formatCurrency(parsedIncome)}</strong>
              </span>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {presetSuggestions.map((preset) => {
              const isPresetSelected =
                !isCustomAmount && Math.abs(numContribution - preset.value) < 0.01

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isPresetSelected
                      ? 'border-[#C3ABFA] bg-[#C3ABFA]/30 text-[#FAFAFA] font-semibold shadow-[0_0_12px_rgba(195,171,250,0.35)]'
                      : 'glass-pill text-[#A3A3A3] hover:text-[#FAFAFA] hover:border-[#C3ABFA]/40'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setIsCustomAmount(true)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                isCustomAmount
                  ? 'border-[#C3ABFA] bg-[#C3ABFA]/30 text-[#FAFAFA] font-semibold'
                  : 'glass-pill text-[#A3A3A3] hover:text-[#FAFAFA] hover:border-[#C3ABFA]/40'
              }`}
            >
              Custom amount
            </button>
          </div>

          {/* Custom Amount Input field if active */}
          {isCustomAmount && (
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <span className="text-xs text-[#A3A3A3] shrink-0">Amount ({currency}):</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={parsedIncome > 0 ? parsedIncome : undefined}
                placeholder="Enter custom amount"
                value={contributionAmount}
                onChange={handleCustomAmountChange}
                className="w-full rounded-xl glass-input px-3 py-1.5 text-xs text-[#FAFAFA] placeholder-[#737373] font-mono"
              />
            </div>
          )}

          {/* Note Input (optional) */}
          <div className="pt-1">
            <input
              type="text"
              maxLength={150}
              placeholder="Add an optional goal contribution note (e.g. Monthly allocation)"
              value={contributionNote}
              onChange={handleNoteChange}
              className="w-full rounded-xl glass-input px-3.5 py-2 text-xs text-[#FAFAFA] placeholder-[#737373]"
            />
          </div>

          {/* Validation Warnings */}
          {isOverIncome && (
            <p className="text-xs text-[#F07891] font-medium">
              ⚠️ Contribution amount ({formatCurrency(numContribution)}) cannot exceed the deposit amount ({formatCurrency(parsedIncome)}).
            </p>
          )}

          {parsedIncome <= 0 && (
            <p className="text-xs text-[#E9BC68]">
              💡 Please enter an income amount above to allocate savings.
            </p>
          )}

          {/* Live Financial Breakdown & Allocation Preview */}
          {numContribution > 0 && !isOverIncome && (
            <div className="mt-3 rounded-2xl glass-subtle border border-[#C3ABFA]/30 p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between text-[#FAFAFA] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#70D6A3]">📈</span>
                  Preview after contribution:
                </span>
                <span className="text-[#70D6A3] font-semibold font-mono">
                  +{formatCurrency(numContribution)} saved
                </span>
              </div>

              {/* Enhanced Dual-segment progress bar */}
              <div className="w-full h-2.5 rounded-full bg-[#101010] overflow-hidden flex border border-[#292929] p-0.5 shadow-inner">
                {/* Existing saved portion */}
                <div
                  className="h-full bg-[#C3ABFA] rounded-l-full transition-all duration-300"
                  style={{ width: `${Math.min(100, currentProgress)}%` }}
                  title={`Existing: ${currentProgress.toFixed(1)}%`}
                />
                {/* New contribution addition */}
                <div
                  className="h-full bg-[#70D6A3] transition-all duration-300"
                  style={{ width: `${Math.min(100 - currentProgress, addedProgressPercent)}%` }}
                  title={`New contribution: +${addedProgressPercent.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#A3A3A3]">
                <div>
                  <span>Allocated to Goal:</span>
                  <p className="font-semibold text-[#70D6A3] font-mono mt-0.5">{formatCurrency(numContribution)}</p>
                </div>
                <div>
                  <span>Unallocated Remainder:</span>
                  <p className="font-semibold text-[#86B8F5] font-mono mt-0.5">{formatCurrency(unallocatedAmount)}</p>
                </div>
                <div>
                  <span>New Total Saved:</span>
                  <p className="font-semibold text-[#FAFAFA] font-mono mt-0.5">{formatCurrency(newSaved)}</p>
                </div>
                <div>
                  <span>New Goal Progress:</span>
                  <p className="font-semibold text-[#70D6A3] font-mono mt-0.5">{newProgress.toFixed(1)}%</p>
                </div>
              </div>

              <p className="text-[10px] text-[#737373] pt-1 border-t border-white/5">
                • Rule Check: Allocating to a goal sets aside money from this deposit. It does not count twice in total balances.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

GoalContributionSuggestion.propTypes = {
  incomeAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  value: PropTypes.shape({
    goalId: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    note: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
}
