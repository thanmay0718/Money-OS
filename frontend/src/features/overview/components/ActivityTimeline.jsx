// src/features/overview/components/ActivityTimeline.jsx
import React from 'react'
import PropTypes from 'prop-types'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Target,
  Wallet,
  ChartNoAxesCombined,
  Award,
  Activity,
  Trash2,
  ChevronRight,
  LoaderCircle,
} from '../../../components/ui/Icons'
import { formatINR } from '../../../lib/format'
import Pagination from '../../../components/ui/Pagination'

const getActivityVisuals = (activityType) => {
  switch (activityType) {
    case 'TRANSACTION_INCOME':
      return {
        icon: <TrendingUp className="w-4 h-4 text-[#70D6A3]" />,
        iconBg: 'bg-[#70D6A3]/15 border-[#70D6A3]/30',
        amountPrefix: '+',
        amountColor: 'text-[#70D6A3]',
        badgeText: 'Income',
        badgeBg: 'bg-[#70D6A3]/10 text-[#70D6A3] border-[#70D6A3]/25',
      }
    case 'TRANSACTION_EXPENSE':
      return {
        icon: <TrendingDown className="w-4 h-4 text-[#F07891]" />,
        iconBg: 'bg-[#F07891]/15 border-[#F07891]/30',
        amountPrefix: '-',
        amountColor: 'text-[#F07891]',
        badgeText: 'Expense',
        badgeBg: 'bg-[#F07891]/10 text-[#F07891] border-[#F07891]/25',
      }
    case 'TRANSACTION_TRANSFER':
      return {
        icon: <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" />,
        iconBg: 'bg-[#86B8F5]/15 border-[#86B8F5]/30',
        amountPrefix: '',
        amountColor: 'text-[#86B8F5]',
        badgeText: 'Transfer',
        badgeBg: 'bg-[#86B8F5]/10 text-[#86B8F5] border-[#86B8F5]/25',
      }
    case 'TRANSACTION_DELETED':
      return {
        icon: <Trash2 className="w-4 h-4 text-[#F07891]" />,
        iconBg: 'bg-[#F07891]/15 border-[#F07891]/30',
        amountPrefix: '',
        amountColor: 'text-[#737373]',
        badgeText: 'Removed',
        badgeBg: 'bg-white/5 text-[#737373] border-white/10',
      }
    case 'GOAL_CONTRIBUTION':
      return {
        icon: <Target className="w-4 h-4 text-[#C3ABFA]" />,
        iconBg: 'bg-[#C3ABFA]/15 border-[#C3ABFA]/30',
        amountPrefix: '+',
        amountColor: 'text-[#C3ABFA]',
        badgeText: 'Goal Contribution',
        badgeBg: 'bg-[#C3ABFA]/10 text-[#C3ABFA] border-[#C3ABFA]/25',
      }
    case 'GOAL_CREATED':
      return {
        icon: <Target className="w-4 h-4 text-[#C3ABFA]" />,
        iconBg: 'bg-[#C3ABFA]/15 border-[#C3ABFA]/30',
        amountPrefix: '',
        amountColor: 'text-[#C3ABFA]',
        badgeText: 'Goal Created',
        badgeBg: 'bg-[#C3ABFA]/10 text-[#C3ABFA] border-[#C3ABFA]/25',
      }
    case 'GOAL_COMPLETED':
      return {
        icon: <Award className="w-4 h-4 text-[#70D6A3]" />,
        iconBg: 'bg-[#70D6A3]/15 border-[#70D6A3]/30',
        amountPrefix: '',
        amountColor: 'text-[#70D6A3]',
        badgeText: 'Goal Completed',
        badgeBg: 'bg-[#70D6A3]/10 text-[#70D6A3] border-[#70D6A3]/25',
      }
    case 'POCKET_CREATED':
    case 'POCKET_UPDATED':
      return {
        icon: <Wallet className="w-4 h-4 text-[#86B8F5]" />,
        iconBg: 'bg-[#86B8F5]/15 border-[#86B8F5]/30',
        amountPrefix: '',
        amountColor: 'text-[#86B8F5]',
        badgeText: 'Pocket',
        badgeBg: 'bg-[#86B8F5]/10 text-[#86B8F5] border-[#86B8F5]/25',
      }
    case 'BUDGET_CREATED':
    case 'BUDGET_UPDATED':
      return {
        icon: <ChartNoAxesCombined className="w-4 h-4 text-[#E9BC68]" />,
        iconBg: 'bg-[#E9BC68]/15 border-[#E9BC68]/30',
        amountPrefix: '',
        amountColor: 'text-[#E9BC68]',
        badgeText: 'Budget',
        badgeBg: 'bg-[#E9BC68]/10 text-[#E9BC68] border-[#E9BC68]/25',
      }
    default:
      return {
        icon: <Activity className="w-4 h-4 text-[#C3ABFA]" />,
        iconBg: 'bg-[#C3ABFA]/15 border-[#C3ABFA]/30',
        amountPrefix: '',
        amountColor: 'text-[#FAFAFA]',
        badgeText: 'Activity',
        badgeBg: 'bg-white/5 text-[#A3A3A3] border-white/10',
      }
  }
}

export default function ActivityTimeline({
  activities = [],
  isLoading,
  loadingMore,
  hasMore,
  onLoadMore,
  onItemClick,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (isLoading && activities.length === 0) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-white/5 bg-[#181818]/60 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5" />
              <div>
                <div className="w-32 h-4 rounded bg-white/5 mb-1.5" />
                <div className="w-48 h-3 rounded bg-white/5" />
              </div>
            </div>
            <div className="w-20 h-4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-14 px-4 rounded-2xl border border-white/5 bg-[#161616]/40">
        <div className="w-12 h-12 rounded-2xl bg-[#C3ABFA]/10 border border-[#C3ABFA]/20 grid place-items-center mx-auto mb-3">
          <Activity className="w-6 h-6 text-[#C3ABFA]" />
        </div>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">
          Your financial journey starts here.
        </h3>
        <p className="text-xs text-[#737373] max-w-sm mx-auto mt-1">
          Record your first transaction, allocate capital to a pocket, or contribute to a goal to start building your activity ledger.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {activities.map((activity) => {
        const visuals = getActivityVisuals(activity.activityType)
        const amountNum = activity.amount ? Number(activity.amount) : null

        return (
          <div
            key={activity.id}
            onClick={() => onItemClick?.(activity)}
            className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-white/5 bg-[#181818]/70 hover:bg-[#1a1a20] hover:border-white/15 transition-all duration-150 cursor-pointer select-none"
          >
            {/* Left: Icon & Description */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-xl border shrink-0 ${visuals.iconBg} transition-transform group-hover:scale-105`}
              >
                {visuals.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-semibold text-[#FAFAFA] truncate group-hover:text-[#C3ABFA] transition-colors">
                    {activity.title}
                  </h4>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium border ${visuals.badgeBg}`}
                  >
                    {visuals.badgeText}
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] truncate mt-0.5">
                  {activity.description || 'Verified financial activity'}
                </p>
              </div>
            </div>

            {/* Right: Amount & Date */}
            <div className="flex items-center gap-3 shrink-0 text-right">
              <div>
                {amountNum !== null && (
                  <div
                    className={`text-xs sm:text-sm font-semibold tabular-nums ${visuals.amountColor}`}
                  >
                    {visuals.amountPrefix}
                    {formatINR(amountNum)}
                  </div>
                )}
                <div className="text-[10px] text-[#737373] mt-0.5">
                  {activity.activityDate}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#737373] group-hover:text-[#FAFAFA] transition-colors hidden sm:block" />
            </div>
          </div>
        )
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          className="mt-2"
        />
      )}

      {/* Legacy Load More fallback if no page change provided */}
      {hasMore && !onPageChange && (
        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[#FAFAFA] transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <LoaderCircle className="w-3.5 h-3.5 animate-spin text-[#C3ABFA]" />
                <span>Loading more activities...</span>
              </>
            ) : (
              <span>Load More Activities</span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

ActivityTimeline.propTypes = {
  activities: PropTypes.array,
  isLoading: PropTypes.bool,
  loadingMore: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
  onItemClick: PropTypes.func,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
}
