// src/features/overview/components/ActivityDetailsModal.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import GlassModal from '../../../components/ui/glass/GlassModal'
import {
  CalendarDays,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from '../../../components/ui/Icons'
import { formatINR } from '../../../lib/format'

export default function ActivityDetailsModal({
  activity,
  isOpen,
  onClose,
}) {
  const navigate = useNavigate()

  if (!activity) return null

  const {
    id,
    activityType,
    title,
    description,
    referenceType,
    referenceId,
    amount,
    activityDate,
    createdAt,
  } = activity

  const handleNavigateToSource = () => {
    onClose()
    switch (referenceType) {
      case 'TRANSACTION':
        navigate('/transactions')
        break
      case 'GOAL':
      case 'GOAL_CONTRIBUTION':
        navigate('/dashboard')
        break
      case 'POCKET':
        navigate('/pockets')
        break
      case 'BUDGET':
        navigate('/dashboard')
        break
      default:
        break
    }
  }

  const getSourceLabel = () => {
    switch (referenceType) {
      case 'TRANSACTION':
        return 'View Transactions Ledger'
      case 'GOAL':
      case 'GOAL_CONTRIBUTION':
        return 'View Savings Goals'
      case 'POCKET':
        return 'View Money Pockets'
      case 'BUDGET':
        return 'View Monthly Budgets'
      default:
        return 'View Record'
    }
  }

  const amountNum = amount ? Number(amount) : null

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Activity Verification"
      subtitle="Financial event ledger record"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        {/* Header Block with Title & Amount */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C3ABFA]">
                {activityType?.replace(/_/g, ' ')}
              </span>
              <h3 className="text-base font-semibold text-[#FAFAFA] mt-0.5">
                {title}
              </h3>
            </div>
            {amountNum !== null && (
              <div className="text-right">
                <span className="text-lg font-bold text-[#FAFAFA] tabular-nums">
                  {formatINR(amountNum)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 rounded-xl border border-white/5 bg-[#141414] p-3 text-xs">
          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-[#737373]" />
              Activity Date
            </span>
            <span className="font-medium text-[#FAFAFA]">{activityDate}</span>
          </div>

          {createdAt && (
            <div className="flex items-center justify-between text-[#A3A3A3]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#737373]" />
                Recorded At
              </span>
              <span className="text-[#737373]">
                {new Date(createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[#A3A3A3]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#70D6A3]" />
              Event Status
            </span>
            <span className="text-[#70D6A3] font-medium">Verified & Immutable</span>
          </div>

          <div className="flex items-center justify-between text-[#737373] text-[10px] pt-1 border-t border-white/5">
            <span>Audit UUID</span>
            <span className="font-mono">{id?.substring(0, 18)}...</span>
          </div>
        </div>

        {/* Action Button to Original Record */}
        {referenceType && (
          <button
            type="button"
            onClick={handleNavigateToSource}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C3ABFA] hover:bg-[#b599f7] text-[#101010] text-xs font-semibold shadow-[0_4px_16px_rgba(195,171,250,0.3)] transition-all"
          >
            <span>{getSourceLabel()}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </GlassModal>
  )
}

ActivityDetailsModal.propTypes = {
  activity: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
