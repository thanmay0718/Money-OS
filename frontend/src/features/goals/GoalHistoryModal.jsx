// src/features/goals/GoalHistoryModal.jsx
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { fetchGoalContributions } from '../../api/goals'
import { GlassModal, GlassButton } from '../../components/ui/glass'

export default function GoalHistoryModal({ goal, onClose }) {
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currencyCode = goal.currency || 'INR'

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(val || 0)
  }

  useEffect(() => {
    let isMounted = true
    const loadHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchGoalContributions(goal.id, { page: 0, size: 50 })
        const items = response.data?.content || response.data || []
        if (isMounted) {
          setContributions(items)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load contribution history.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadHistory()
    return () => {
      isMounted = false
    }
  }, [goal.id])

  const saved = Number(goal.savedAmount) || 0
  const target = Number(goal.targetAmount) || 0
  const remaining = Number(
    goal.remainingAmount != null ? goal.remainingAmount : Math.max(0, target - saved)
  )

  return (
    <GlassModal
      isOpen={true}
      onClose={onClose}
      title="Contribution History"
      subtitle={`Recorded contributions toward "${goal.title}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Totals Summary */}
        <div className="grid grid-cols-3 gap-2.5 rounded-2xl glass-subtle border border-slate-700/60 p-3.5 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Total Saved
            </span>
            <span className="text-sm font-semibold text-emerald-400 mt-1 block font-mono">
              {formatCurrency(saved)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Target
            </span>
            <span className="text-sm font-semibold text-slate-200 mt-1 block font-mono">
              {formatCurrency(target)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Remaining
            </span>
            <span className="text-sm font-semibold text-indigo-300 mt-1 block font-mono">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <span>Loading contribution history…</span>
          </div>
        ) : error ? (
          <div role="alert" className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs text-center">
            {error}
          </div>
        ) : contributions.length > 0 ? (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {contributions.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl glass-subtle border border-slate-700/60 text-xs hover:bg-white/[0.04] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">
                      {item.pocketName || 'Source Pocket'}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      {item.contributionDate ||
                        new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-slate-400 text-[11px] mt-0.5 italic">"{item.note}"</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-400 text-sm font-mono">
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            <p className="font-medium text-slate-300">No contributions recorded yet for this goal.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click "+ Add Money" on the goal card to allocate your first contribution.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-700/50">
          <GlassButton onClick={onClose} variant="secondary">
            Close
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  )
}

GoalHistoryModal.propTypes = {
  goal: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}
