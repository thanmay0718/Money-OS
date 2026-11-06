// src/features/overview/OverviewPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOverviewSummary,
  fetchHeatmap,
  fetchActivities,
  fetchMoreActivities,
  fetchActivityDetail,
  fetchGamificationOverview,
  triggerBackfill,
  setFilterDateRange,
  setFilterTypes,
  setFilterSearch,
  setSelectedDate,
  clearSelectedDate,
  clearSelectedActivity,
} from './overviewSlice'
import OverviewHeader from './components/OverviewHeader'
import ActivitySummaryCards from './components/ActivitySummaryCards'
import StreakCard from './components/StreakCard'
import ContributionSkyline from './ContributionSkyline'
import AchievementGallery from './components/AchievementGallery'
import ActivityFilters from './components/ActivityFilters'
import ActivityTimeline from './components/ActivityTimeline'
import ActivityDetailsModal from './components/ActivityDetailsModal'
import RewardsStoreModal from './components/RewardsStoreModal'
import { Activity, Sparkles } from '../../components/ui/Icons'
import { toast } from '../../lib/toast'

export default function OverviewPage() {
  const dispatch = useDispatch()

  const {
    summary,
    summaryStatus,
    heatmap,
    heatmapStatus,
    activities,
    activitiesPage,
    activitiesStatus,
    loadingMore,
    selectedActivity,
    gamification,
    gamificationStatus,
    gamificationError,
    filters,
    selectedDate,
  } = useSelector((state) => state.overview)

  const [sortOrder, setSortOrder] = useState('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [timelinePage, setTimelinePage] = useState(0)
  const [showRewards, setShowRewards] = useState(false)

  // Reset page when filters change
  useEffect(() => {
    setTimelinePage(0)
  }, [filters.dateRange, filters.types, filters.search, selectedDate])

  // Calculate start/end date strings based on selected period
  const dateBounds = useMemo(() => {
    const today = new Date()
    const endDateStr = today.toISOString().split('T')[0]
    let startDateObj = new Date(today)

    if (filters.dateRange === 'last30days') {
      startDateObj.setDate(startDateObj.getDate() - 30)
    } else if (filters.dateRange === 'last6months') {
      startDateObj.setMonth(startDateObj.getMonth() - 6)
    } else {
      // Default: last 12 months
      startDateObj.setFullYear(startDateObj.getFullYear() - 1)
    }

    const startDateStr = startDateObj.toISOString().split('T')[0]
    return { startDate: startDateStr, endDate: endDateStr }
  }, [filters.dateRange])

  // Initial load & automatic silent backfill to ensure historical records are visible
  useEffect(() => {
    // Attempt silent backfill on first mount (idempotent, won't duplicate)
    dispatch(triggerBackfill())
      .unwrap()
      .catch(() => {
        // Backfill silently handled
      })
    // Load gamification data (streaks, achievements, coins)
    dispatch(fetchGamificationOverview())
  }, [dispatch])

  // Trigger celebratory milestone toast if newly unlocked
  useEffect(() => {
    if (gamification?.recentUnlocks && Array.isArray(gamification.recentUnlocks)) {
      const oneMinuteAgo = Date.now() - 60 * 1000
      gamification.recentUnlocks.forEach((unlock) => {
        if (unlock.unlockedAt && new Date(unlock.unlockedAt).getTime() > oneMinuteAgo) {
          toast.success(
            `Achievement Unlocked: ${unlock.title}`,
            `+${unlock.coinReward} Coins - ${unlock.description}`
          )
        }
      })
    }
  }, [gamification?.recentUnlocks])

  // Load summary and heatmap when date range changes
  useEffect(() => {
    dispatch(
      fetchOverviewSummary({
        startDate: dateBounds.startDate,
        endDate: dateBounds.endDate,
      })
    )
    dispatch(
      fetchHeatmap({
        startDate: dateBounds.startDate,
        endDate: dateBounds.endDate,
      })
    )
  }, [dispatch, dateBounds])

  // Load timeline activities whenever filters or date bounds change
  useEffect(() => {
    const params = {
      page: timelinePage,
      size: 10,
      startDate: selectedDate ? selectedDate : dateBounds.startDate,
      endDate: selectedDate ? selectedDate : dateBounds.endDate,
      sort: sortOrder === 'asc' ? 'activityDate,asc' : 'activityDate,desc',
    }

    if (filters.types && filters.types.length > 0) {
      params.types = filters.types.join(',')
    }
    if (filters.search?.trim()) {
      params.search = filters.search.trim()
    }

    dispatch(fetchActivities(params))
  }, [dispatch, dateBounds, filters.types, filters.search, selectedDate, sortOrder, timelinePage])

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        dispatch(
          fetchOverviewSummary({
            startDate: dateBounds.startDate,
            endDate: dateBounds.endDate,
          })
        ).unwrap(),
        dispatch(fetchGamificationOverview()).unwrap(),
        dispatch(
          fetchHeatmap({
            startDate: dateBounds.startDate,
            endDate: dateBounds.endDate,
          })
        ).unwrap(),
        dispatch(
          fetchActivities({
            page: 0,
            size: 20,
            startDate: selectedDate ? selectedDate : dateBounds.startDate,
            endDate: selectedDate ? selectedDate : dateBounds.endDate,
            sort: sortOrder === 'asc' ? 'activityDate,asc' : 'activityDate,desc',
            ...(filters.types?.length ? { types: filters.types.join(',') } : {}),
            ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
          })
        ).unwrap(),
      ])
      toast.success('Overview synchronized with your ledger.')
    } catch {
      toast.error('Failed to refresh overview.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle heatmap cell click
  const handleHeatmapCellClick = useCallback(
    (cell) => {
      if (!cell || !cell.date) return
      dispatch(setSelectedDate(cell.date))
      // Smooth scroll to timeline
      const timelineEl = document.getElementById('activity-timeline-section')
      if (timelineEl) {
        timelineEl.scrollIntoView({ behavior: 'smooth' })
      }
    },
    [dispatch]
  )

  // Handle timeline item click for details modal
  const handleActivityClick = async (activity) => {
    dispatch(fetchActivityDetail(activity.id))
    setModalOpen(true)
  }

  // Handle load more pagination
  const handleLoadMore = () => {
    if (activitiesPage.last || loadingMore) return
    const nextPage = activitiesPage.number + 1

    const params = {
      page: nextPage,
      size: 20,
      startDate: selectedDate ? selectedDate : dateBounds.startDate,
      endDate: selectedDate ? selectedDate : dateBounds.endDate,
      sort: sortOrder === 'asc' ? 'activityDate,asc' : 'activityDate,desc',
    }

    if (filters.types && filters.types.length > 0) {
      params.types = filters.types.join(',')
    }
    if (filters.search?.trim()) {
      params.search = filters.search.trim()
    }

    dispatch(fetchMoreActivities(params))
  }

  // Prepare data for ContributionSkyline
  const skylineData = useMemo(() => {
    if (!heatmap || !Array.isArray(heatmap)) return []
    return heatmap.map((d) => ({
      date: d.date,
      count: Number(d.activityCount || 0),
    }))
  }, [heatmap])

  // Prepare map for extended financial tooltip
  const tooltipDataMap = useMemo(() => {
    if (!heatmap || !Array.isArray(heatmap)) return {}
    const map = {}
    heatmap.forEach((d) => {
      map[d.date] = {
        income: Number(d.income || 0),
        expenses: Number(d.expenses || 0),
        goalContributions: Number(d.goalContributions || 0),
        transactionCount: Number(d.transactionCount || 0),
      }
    })
    return map
  }, [heatmap])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header with Period Filter & Refresh */}
      <OverviewHeader
        dateRange={filters.dateRange}
        onPeriodChange={(period) => dispatch(setFilterDateRange(period))}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        totalCoins={gamification?.totalCoins || 0}
        loadingCoins={gamificationStatus === 'loading' && !gamification}
        coinsUnavailable={gamificationStatus === 'failed'}
        onOpenRewards={() => setShowRewards(true)}
      />

      {/* 2. Top Financial Activity Summary Cards */}
      <ActivitySummaryCards
        summary={summary}
        isLoading={summaryStatus === 'loading' && !summary}
        onCardClick={(cardId) => {
          if (cardId === 'total-activities') {
            dispatch(setFilterTypes(null))
          } else if (cardId === 'net-savings') {
            dispatch(setFilterTypes(['TRANSACTION_INCOME', 'TRANSACTION_EXPENSE']))
          }
        }}
      />

      {/* 2b. Habit & Consistency Streak System */}
      <StreakCard
        streak={gamification?.streak}
        loading={gamificationStatus === 'loading' && !gamification}
        error={gamificationStatus === 'failed' ? gamificationError : null}
        onRetry={() => dispatch(fetchGamificationOverview())}
      />

      {/* 3. GitHub-Inspired 2D/3D Activity Skyline Heatmap */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C3ABFA]" />
            <h2 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">
              Activity Skyline
            </h2>
          </div>
          <span className="text-[11px] text-[#737373]">
            2D Heatmap & 3D Isometric View
          </span>
        </div>

        {heatmapStatus === 'loading' && skylineData.length === 0 ? (
          <div className="w-full h-48 rounded-2xl border border-white/5 bg-[#181818]/60 animate-pulse flex items-center justify-center">
            <span className="text-xs text-[#737373]">Rendering financial activity grid...</span>
          </div>
        ) : (
          <ContributionSkyline
            data={skylineData}
            palette="moneyos"
            unit="activity"
            unitPlural="activities"
            defaultView="2d"
            onCellClick={handleHeatmapCellClick}
            tooltipData={tooltipDataMap}
            title={
              summary ? (
                <>
                  <span className="font-semibold text-[#C3ABFA] tabular-nums">
                    {Number(summary.totalActivities || 0).toLocaleString('en-IN')}
                  </span>{' '}
                  verified financial activities in selected period
                </>
              ) : null
            }
            weekStart={1}
            locale="en-IN"
          />
        )}
      </div>

      {/* 3b. Financial Achievement Badges & Progression Gallery */}
      <AchievementGallery
        achievements={gamification?.achievements || []}
        loading={gamificationStatus === 'loading' && !gamification}
        error={gamificationStatus === 'failed' ? gamificationError : null}
        onRetry={() => dispatch(fetchGamificationOverview())}
      />

      {/* 4. Unified Chronological Activity Timeline Feed */}
      <div
        id="activity-timeline-section"
        className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-[#161616]/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C3ABFA]" />
            <h2 className="text-base font-semibold text-[#FAFAFA] tracking-tight">
              Activity Timeline
            </h2>
          </div>
          <span className="text-xs text-[#737373] tabular-nums">
            {activitiesPage.totalElements}{' '}
            {activitiesPage.totalElements === 1 ? 'event recorded' : 'events recorded'}
          </span>
        </div>

        {/* Timeline Filters: Pills, Search & Date Filter */}
        <ActivityFilters
          activeTypes={filters.types}
          onTypeChange={(types) => dispatch(setFilterTypes(types))}
          searchQuery={filters.search}
          onSearchChange={(query) => dispatch(setFilterSearch(query))}
          selectedDate={selectedDate}
          onClearDate={() => dispatch(clearSelectedDate())}
          sortOrder={sortOrder}
          onToggleSort={() =>
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
          }
        />

        {/* Timeline Event Feed */}
        <ActivityTimeline
          activities={activities}
          isLoading={activitiesStatus === 'loading'}
          loadingMore={loadingMore}
          hasMore={!activitiesPage.last}
          onLoadMore={handleLoadMore}
          onItemClick={handleActivityClick}
          currentPage={(activitiesPage.number ?? timelinePage) + 1}
          totalPages={activitiesPage.totalPages || 1}
          totalItems={activitiesPage.totalElements || 0}
          pageSize={activitiesPage.size || 10}
          onPageChange={(page) => setTimelinePage(page - 1)}
        />
      </div>

      {/* 5. Activity Detail Modal */}
      <ActivityDetailsModal
        activity={selectedActivity}
        isOpen={modalOpen && !!selectedActivity}
        onClose={() => {
          setModalOpen(false)
          dispatch(clearSelectedActivity())
        }}
      />

      {/* 6. Rewards & Coin Marketplace Modal */}
      <RewardsStoreModal
        isOpen={showRewards}
        onClose={() => setShowRewards(false)}
      />
    </div>
  )
}
