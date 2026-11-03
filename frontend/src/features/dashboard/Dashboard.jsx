// src/features/dashboard/Dashboard.jsx — Lavender Dawn theme
import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchPockets } from '../pockets/pocketsSlice'
import { fetchAllTransactions } from '../transactions/transactionsSlice'
import { fetchDashboardInsights } from './dashboardSlice'
import {
  GlassSurface,
  GlassPanel,
  GlassButton,
  GlassBadge,
  GlassProgressIndicator,
  GlassInput,
} from '../../components/ui/glass'
import {
  Plus,
  TriangleAlert,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Upload,
  ImagePlus,
  Image,
  SlidersHorizontal,
  ListOrdered,
  Sparkles,
} from '../../components/ui/Icons'
import { toast } from '../../lib/toast'
import CashFlowChart from '../../components/charts/CashFlowChart'
import AllocationBar from '../../components/charts/AllocationBar'
import { createGoal as createFinancialGoal } from '../../api/goals'
import GoalContributionModal from '../goals/GoalContributionModal'
import GoalHistoryModal from '../goals/GoalHistoryModal'
import PolaroidLineCarousel from '../../components/ui/polaroid-line-carousel'

// Semantic financial colors for Lavender Dawn
const CLR_INCOME   = '#70D6A3'
const CLR_EXPENSE  = '#F07891'
const CLR_TRANSFER = '#86B8F5'
const CLR_LAVENDER = '#C3ABFA'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { list: pockets, status: pocketsStatus } = useSelector((state) => state.pockets)
  const { list: transactions, status: txStatus } = useSelector((state) => state.transactions)
  const { budgetSuggestion, goalProgress, status: insightsStatus, error: insightsError } = useSelector(
    (state) => state.dashboard
  )
  const user = useSelector((state) => state.auth.user)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', savedAmount: '', targetDate: '' })
  const [goalError, setGoalError] = useState('')
  const [goalSaving, setGoalSaving] = useState(false)
  const [selectedContributionGoal, setSelectedContributionGoal] = useState(null)
  const [viewingHistoryGoal, setViewingHistoryGoal] = useState(null)

  // Polaroid Carousel & Goal Image state
  const [activeGoalIndex, setActiveGoalIndex] = useState(0)
  const [goalViewMode, setGoalViewMode] = useState('carousel') // 'carousel' | 'grid'
  const [goalImages, setGoalImages] = useState(() => {
    try {
      const stored = localStorage.getItem('moneyos_goal_images')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })
  const [goalImagePreview, setGoalImagePreview] = useState(null)
  const goalFileInputRef = useRef(null)
  const directGoalUploadRef = useRef(null)
  const [uploadTargetGoal, setUploadTargetGoal] = useState(null)

  const handleGoalImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format', 'Please upload an image file (PNG, JPG, WebP).')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setGoalImagePreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerUploadForGoal = (goal) => {
    setUploadTargetGoal(goal)
    directGoalUploadRef.current?.click()
  }

  const handleDirectGoalImageUpload = (goal, file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format', 'Please upload an image file (PNG, JPG, WebP).')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      const nextImages = {
        ...goalImages,
        [goal.id]: dataUrl,
        [goal.title]: dataUrl,
      }
      setGoalImages(nextImages)
      try {
        localStorage.setItem('moneyos_goal_images', JSON.stringify(nextImages))
      } catch (err) {
        console.warn('Could not store goal image to localStorage', err)
      }
      toast.success(`Photo updated for "${goal.title}"`)
    }
    reader.readAsDataURL(file)
  }

  const currencyCode = budgetSuggestion?.currency || user?.currency || 'INR'

  useEffect(() => {
    dispatch(fetchPockets())
    dispatch(fetchAllTransactions())
    dispatch(fetchDashboardInsights())
  }, [dispatch])

  let fallbackIncome = 0
  let fallbackExpenses = 0
  if (transactions && transactions.length > 0) {
    for (const tx of transactions) {
      const amt = Number(tx.amount) || 0
      if (tx.type === 'INCOME') fallbackIncome += amt
      if (tx.type === 'EXPENSE') fallbackExpenses += amt
    }
  }

  const hasInsight = Boolean(budgetSuggestion)
  const totalIncome =
    hasInsight && budgetSuggestion.recordedIncome != null
      ? Number(budgetSuggestion.recordedIncome)
      : fallbackIncome
  const totalExpenses =
    hasInsight && budgetSuggestion.recordedExpense != null
      ? Number(budgetSuggestion.recordedExpense)
      : fallbackExpenses

  const netCashFlow = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0

  const availableToSpend =
    hasInsight && budgetSuggestion.availableToSpend != null
      ? Number(budgetSuggestion.availableToSpend)
      : null

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '—'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : []

  const handleCreateGoal = async (event) => {
    event.preventDefault()
    setGoalError('')

    const targetAmount = Number(goalForm.targetAmount)
    const savedAmount = goalForm.savedAmount === '' ? 0 : Number(goalForm.savedAmount)
    if (!goalForm.title.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      setGoalError('Enter a goal name and a target amount greater than zero.')
      return
    }
    if (!Number.isFinite(savedAmount) || savedAmount < 0) {
      setGoalError('Saved amount cannot be negative.')
      return
    }

    setGoalSaving(true)
    const goalTitle = goalForm.title.trim()
    try {
      await createFinancialGoal({
        title: goalTitle,
        targetAmount,
        savedAmount,
        currency: currencyCode,
        targetDate: goalForm.targetDate || null,
      })

      if (goalImagePreview) {
        const nextImages = { ...goalImages, [goalTitle]: goalImagePreview }
        setGoalImages(nextImages)
        try {
          localStorage.setItem('moneyos_goal_images', JSON.stringify(nextImages))
        } catch (e) {
          console.warn('Could not store goal image to localStorage', e)
        }
      }

      setGoalForm({ title: '', targetAmount: '', savedAmount: '', targetDate: '' })
      setGoalImagePreview(null)
      setShowGoalForm(false)
      dispatch(fetchDashboardInsights())
      toast.success(`Savings goal "${goalTitle}" created.`, 'Target tracking is now active.')
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Unable to create the goal.'
      setGoalError(errorMsg)
      toast.error("Couldn't create goal.", errorMsg)
    } finally {
      setGoalSaving(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Real-time financial status, liquidity &amp; automated cash allocation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <GlassButton
            variant="primary"
            onClick={() => navigate('/transactions')}
            icon={<Plus className="w-4 h-4" />}
          >
            New Transaction
          </GlassButton>
        </div>
      </div>

      {/* Error banner */}
      {insightsStatus === 'failed' && insightsError && (
        <div className="p-3.5 rounded-2xl glass-surface border-[#F07891]/30 bg-[#F07891]/[0.06] text-[#F07891] text-xs flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-[#F07891]" />
          <span>Unable to refresh server financial insights: {insightsError}. Displaying locally cached data.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {/* Net Cash Flow */}
        <GlassSurface className="p-5 relative overflow-hidden group hover:border-white/15">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all"
            style={{ background: `${netCashFlow >= 0 ? CLR_INCOME : CLR_EXPENSE}1A` }} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Net Cash Flow
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: netCashFlow >= 0 ? CLR_INCOME : CLR_EXPENSE,
                boxShadow: `0 0 8px ${netCashFlow >= 0 ? CLR_INCOME : CLR_EXPENSE}`,
              }}
            />
          </div>
          <p
            className="text-2xl font-bold tracking-tight mt-2 font-mono"
            style={{ color: netCashFlow > 0 ? CLR_INCOME : netCashFlow < 0 ? CLR_EXPENSE : '#FAFAFA' }}
          >
            {formatCurrency(netCashFlow)}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">Recorded income minus expenses</span>
        </GlassSurface>

        {/* Total Income */}
        <GlassSurface className="p-5 relative overflow-hidden group hover:border-white/15">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all"
            style={{ background: `${CLR_INCOME}1A` }} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Total Income
            </span>
            <span className="w-2 h-2 rounded-full"
              style={{ background: CLR_INCOME, boxShadow: `0 0 8px ${CLR_INCOME}` }} />
          </div>
          <p className="text-2xl font-bold tracking-tight mt-2 font-mono" style={{ color: CLR_INCOME }}>
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">From verified deposits</span>
        </GlassSurface>

        {/* Total Expenses */}
        <GlassSurface className="p-5 relative overflow-hidden group hover:border-white/15">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all"
            style={{ background: `${CLR_EXPENSE}1A` }} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Total Expenses
            </span>
            <span className="w-2 h-2 rounded-full"
              style={{ background: CLR_EXPENSE, boxShadow: `0 0 8px ${CLR_EXPENSE}` }} />
          </div>
          <p className="text-2xl font-bold tracking-tight mt-2 font-mono" style={{ color: CLR_EXPENSE }}>
            {formatCurrency(totalExpenses)}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">Total debits recorded</span>
        </GlassSurface>

        {/* Available to Spend */}
        <GlassSurface className="p-5 relative overflow-hidden group hover:border-white/15 border-[#C3ABFA]/20 bg-[#C3ABFA]/[0.04]">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: `${CLR_LAVENDER}22` }} />
          <div
            className="flex items-center justify-between cursor-help"
            title={
              availableToSpend == null
                ? 'Not enough data. Set a monthly income estimate to calculate this planning amount.'
                : `Monthly planning estimate: income estimate minus expenses recorded ${budgetSuggestion?.calculationPeriod || 'in current month'}. This is not a current cash balance.`
            }
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: CLR_LAVENDER }}>
              Available to Spend
            </span>
            <GlassBadge variant="accent" size="sm">ESTIMATE</GlassBadge>
          </div>
          <p
            className="text-2xl font-bold tracking-tight mt-2 font-mono"
            style={{ color: availableToSpend != null && availableToSpend < 0 ? CLR_EXPENSE : CLR_LAVENDER }}
          >
            {availableToSpend !== null ? formatCurrency(availableToSpend) : 'Not enough data'}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">
            {availableToSpend !== null ? 'Monthly planning estimate' : 'Set a positive income estimate'}
          </span>
        </GlassSurface>

        {/* Savings Rate */}
        <GlassSurface className="p-5 relative overflow-hidden group hover:border-white/15">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all"
            style={{ background: `${CLR_LAVENDER}15` }} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Savings Rate
            </span>
            <span className="w-2 h-2 rounded-full"
              style={{ background: CLR_LAVENDER, boxShadow: `0 0 8px ${CLR_LAVENDER}` }} />
          </div>
          <p className="text-2xl font-bold tracking-tight mt-2 font-mono" style={{ color: CLR_LAVENDER }}>
            {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : 'N/A'}
          </p>
          <span className="text-[11px] text-[#737373] mt-1 block">
            {totalIncome > 0 ? 'Retained of income' : 'Requires income entry'}
          </span>
        </GlassSurface>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="min-h-[320px] flex flex-col justify-between">
          <CashFlowChart transactions={transactions} currencyCode={currencyCode} />
        </GlassPanel>

        <GlassPanel className="min-h-[320px] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#FAFAFA] tracking-tight">
                  Money Pocket Allocation
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  How your money is distributed across configured pockets
                </p>
              </div>
              <GlassBadge variant="default" size="sm">
                {pockets?.length || 0} Pockets
              </GlassBadge>
            </div>
            <div className="mt-5">
              <AllocationBar
                pockets={pockets}
                transactions={transactions}
                currencyCode={currencyCode}
              />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-[#292929] flex justify-end">
            <button
              onClick={() => navigate('/pockets')}
              className="text-xs font-medium inline-flex items-center gap-1 group transition-colors"
              style={{ color: CLR_LAVENDER }}
            >
              <span>Manage Pockets</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        </GlassPanel>
      </div>

      {/* Savings Goals */}
      <section className="space-y-4">
        {/* Hidden file input for direct goal image uploads */}
        <input
          type="file"
          ref={directGoalUploadRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && uploadTargetGoal) {
              handleDirectGoalImageUpload(uploadTargetGoal, file)
            }
            e.target.value = ''
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#FAFAFA] tracking-tight">
                Savings &amp; Financial Goals
              </h2>
              {goalProgress && goalProgress.length > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
                  {goalProgress.length} {goalProgress.length === 1 ? 'Goal' : 'Goals'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373]">
              Active milestones, instant Polaroid prints, photo inspiration &amp; atomic contributions
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {goalProgress && goalProgress.length > 0 && (
              <div className="flex items-center p-0.5 rounded-xl bg-[#141414] border border-[#292929]">
                <button
                  type="button"
                  onClick={() => setGoalViewMode('carousel')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    goalViewMode === 'carousel'
                      ? 'bg-[#C3ABFA]/20 text-[#FAFAFA] border border-[#C3ABFA]/30 shadow-sm'
                      : 'text-[#737373] hover:text-[#FAFAFA]'
                  }`}
                  title="Polaroid Carousel View"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C3ABFA]" />
                  <span>Carousel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGoalViewMode('grid')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    goalViewMode === 'grid'
                      ? 'bg-[#C3ABFA]/20 text-[#FAFAFA] border border-[#C3ABFA]/30 shadow-sm'
                      : 'text-[#737373] hover:text-[#FAFAFA]'
                  }`}
                  title="Grid Cards View"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-[#C3ABFA]" />
                  <span>Grid</span>
                </button>
              </div>
            )}
            <button
              onClick={() => navigate('/onboarding')}
              className="text-xs text-[#737373] hover:text-[#A3A3A3] transition-colors font-medium"
            >
              Update Profile &rarr;
            </button>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => { setGoalError(''); setGoalImagePreview(null); setShowGoalForm(!showGoalForm) }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Goal
            </GlassButton>
          </div>
        </div>

        {/* Goal Form */}
        {showGoalForm && (
          <GlassPanel className="border-[#C3ABFA]/20 bg-[#181818]/90 animate-in fade-in duration-200">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-3">Create New Savings Goal</h3>
            <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassInput
                label="Goal name"
                required
                value={goalForm.title}
                onChange={(e) => setGoalForm((c) => ({ ...c, title: e.target.value }))}
                placeholder="Emergency fund, MacBook, Europe Trip..."
                containerClassName="sm:col-span-2"
              />
              <GlassInput
                label="Target amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm((c) => ({ ...c, targetAmount: e.target.value }))}
                placeholder="50000"
              />
              <GlassInput
                label="Already saved"
                type="number"
                min="0"
                step="0.01"
                value={goalForm.savedAmount}
                onChange={(e) => setGoalForm((c) => ({ ...c, savedAmount: e.target.value }))}
                placeholder="0"
              />
              <GlassInput
                label="Target date (optional)"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm((c) => ({ ...c, targetDate: e.target.value }))}
                containerClassName="sm:col-span-2"
              />

              {/* Goal Inspiration Image Upload */}
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1.5">
                  Goal Photo / Inspiration (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={goalFileInputRef}
                    accept="image/*"
                    onChange={handleGoalImagePick}
                    className="hidden"
                  />
                  {goalImagePreview ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/10 w-full">
                      <img
                        src={goalImagePreview}
                        alt="Goal preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#FAFAFA] truncate">Image Selected</p>
                        <p className="text-[11px] text-[#737373]">Will display on your Polaroid print</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGoalImagePreview(null)}
                        className="p-1.5 text-xs text-[#F07891] hover:bg-[#F07891]/10 rounded-lg transition-colors"
                        title="Remove image"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goalFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#3A3A3A] hover:border-[#C3ABFA] bg-[#141414] hover:bg-[#1A1A1A] text-xs font-medium text-[#D5C5FF] transition-all"
                    >
                      <ImagePlus className="w-4 h-4 text-[#C3ABFA]" />
                      <span>Upload Goal Photo or Dream Picture</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-3 flex items-end justify-between gap-3">
                {goalError && <p className="text-[#F07891] text-xs font-medium pb-2">{goalError}</p>}
                <div className="flex gap-2 ml-auto">
                  <GlassButton type="button" variant="ghost" size="sm" onClick={() => { setShowGoalForm(false); setGoalImagePreview(null) }}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" loading={goalSaving}>
                    Save Goal
                  </GlassButton>
                </div>
              </div>
            </form>
          </GlassPanel>
        )}

        {/* Goals Presentation: Polaroid Line Carousel or Grid */}
        {insightsStatus === 'loading' && (!goalProgress || goalProgress.length === 0) ? (
          <GlassSurface className="p-8 text-center text-[#737373] text-sm">
            <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin mx-auto mb-2" />
            <p>Loading savings goals…</p>
          </GlassSurface>
        ) : goalProgress && goalProgress.length > 0 ? (
          <>
            {goalViewMode === 'carousel' ? (
              <div className="space-y-4">
                {/* Polaroid Line Carousel Container */}
                <GlassPanel className="p-2 sm:p-4 overflow-hidden relative border-white/10 bg-gradient-to-b from-[#181818]/90 to-[#121212]/95 shadow-2xl">
                  <div className="flex items-center justify-between px-3 pt-2 pb-1 text-xs text-[#737373]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C3ABFA] animate-pulse" />
                      <span className="font-semibold text-[#FAFAFA]">Interactive Polaroid Line</span>
                      <span className="hidden sm:inline text-[11px] text-[#737373]">• Drag prints or use arrows</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#D5C5FF]">
                      Hover photo to change picture
                    </span>
                  </div>

                  <PolaroidLineCarousel
                    slides={goalProgress.map((goal, idx) => {
                      const percent = Number(goal.progressPercentage) || 0
                      const savedStr = formatCurrency(goal.savedAmount)
                      const targetStr = formatCurrency(goal.targetAmount)
                      const img = goalImages[goal.id] || goalImages[goal.title] || ''
                      const palettes = ['dawn', 'alpine', 'dusk', 'mist']
                      return {
                        id: goal.id,
                        title: goal.title,
                        caption: `${savedStr} saved of ${targetStr} (${percent.toFixed(0)}%) • ${goal.status}`,
                        image: img,
                        palette: palettes[idx % palettes.length],
                        seed: (idx + 1) * 13,
                        goal,
                      }
                    })}
                    height="380px"
                    cardWidth={240}
                    sag={34}
                    swing={1}
                    autoplay={0}
                    string="#A39682"
                    background="transparent"
                    ink="#FAFAFA"
                    onChange={(idx) => setActiveGoalIndex(idx)}
                    onUploadImage={(idx) => {
                      const target = goalProgress[idx]
                      if (target) triggerUploadForGoal(target)
                    }}
                  />
                </GlassPanel>

                {/* Active Goal Quick Details & Action Dock */}
                {(() => {
                  const activeGoal = goalProgress[activeGoalIndex] || goalProgress[0]
                  if (!activeGoal) return null

                  const percent = Number(activeGoal.progressPercentage) || 0
                  const isComplete = activeGoal.status === 'COMPLETED'
                  const isOverachieved = activeGoal.status === 'OVERACHIEVED'
                  const isOverdue = activeGoal.status === 'OVERDUE'
                  const badgeVariant = isComplete ? 'positive' : isOverachieved ? 'purple' : isOverdue ? 'negative' : 'default'
                  const progressVariant = isComplete ? 'emerald' : isOverachieved ? 'gradient' : isOverdue ? 'rose' : 'lavender'
                  const hasImage = Boolean(goalImages[activeGoal.id] || goalImages[activeGoal.title])

                  return (
                    <GlassSurface className="p-5 border-[#C3ABFA]/25 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent shadow-xl">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Goal Overview */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🎯</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-base text-[#FAFAFA] truncate">
                                  {activeGoal.title}
                                </h3>
                                <GlassBadge variant={badgeVariant} size="sm">
                                  {activeGoal.status}
                                </GlassBadge>
                              </div>
                              <p className="text-xs text-[#737373] mt-0.5">
                                Goal #{activeGoalIndex + 1} of {goalProgress.length}
                                {activeGoal.targetDate ? ` • Target: ${new Date(activeGoal.targetDate).toLocaleDateString()}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="max-w-xl">
                            <GlassProgressIndicator
                              value={percent}
                              max={100}
                              showLabel
                              label="Completion Progress"
                              variant={progressVariant}
                              size="md"
                            />
                          </div>
                        </div>

                        {/* Financial Stats Summary */}
                        <div className="flex items-center gap-4 sm:gap-6 border-y lg:border-y-0 lg:border-x border-[#292929] py-3 lg:py-0 lg:px-6">
                          <div>
                            <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold block">Saved</span>
                            <span className="text-base font-bold text-[#FAFAFA] font-mono">{formatCurrency(activeGoal.savedAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold block">Target</span>
                            <span className="text-base font-bold text-[#A3A3A3] font-mono">{formatCurrency(activeGoal.targetAmount)}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold block">Remaining</span>
                            <span className="text-base font-bold font-mono text-[#C3ABFA]">
                              {formatCurrency(
                                activeGoal.remainingAmount != null
                                  ? activeGoal.remainingAmount
                                  : Math.max(0, (Number(activeGoal.targetAmount) || 0) - (Number(activeGoal.savedAmount) || 0))
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 flex-wrap lg:flex-nowrap shrink-0">
                          <button
                            type="button"
                            onClick={() => triggerUploadForGoal(activeGoal)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#FAFAFA] bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 transition-colors"
                            title="Upload custom image for this goal"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#C3ABFA]" />
                            <span>{hasImage ? 'Change Photo' : 'Upload Photo'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingHistoryGoal(activeGoal)}
                            className="px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] transition-colors"
                          >
                            History
                          </button>
                          <GlassButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedContributionGoal(activeGoal)}
                          >
                            + Add Money
                          </GlassButton>
                        </div>
                      </div>
                    </GlassSurface>
                  )
                })()}
              </div>
            ) : (
              /* Grid Cards Mode */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalProgress.map((goal) => {
                  const percent = Number(goal.progressPercentage) || 0
                  const isComplete = goal.status === 'COMPLETED'
                  const isOverachieved = goal.status === 'OVERACHIEVED'
                  const isOverdue = goal.status === 'OVERDUE'
                  const badgeVariant = isComplete ? 'positive' : isOverachieved ? 'purple' : isOverdue ? 'negative' : 'default'
                  const progressVariant = isComplete ? 'emerald' : isOverachieved ? 'gradient' : isOverdue ? 'rose' : 'lavender'
                  const goalImg = goalImages[goal.id] || goalImages[goal.title]

                  return (
                    <GlassSurface
                      key={goal.id}
                      className="p-5 flex flex-col justify-between hover:border-white/15 transition-all duration-200 group"
                    >
                      <div>
                        {goalImg && (
                          <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-white/10">
                            <img src={goalImg} alt={goal.title} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => triggerUploadForGoal(goal)}
                              className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                              title="Change goal photo"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-sm text-[#FAFAFA] truncate" title={goal.title}>
                            {goal.title}
                          </h3>
                          <GlassBadge variant={badgeVariant} size="sm">{goal.status}</GlassBadge>
                        </div>
                        <div className="mt-2 mb-1">
                          <GlassProgressIndicator
                            value={percent}
                            max={100}
                            showLabel
                            label="Progress"
                            variant={progressVariant}
                            size="md"
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-[#292929] space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#737373]">
                          <span>Saved:</span>
                          <strong className="text-[#FAFAFA] font-mono">{formatCurrency(goal.savedAmount)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#737373]">
                          <span>Target:</span>
                          <strong className="text-[#A3A3A3] font-mono">{formatCurrency(goal.targetAmount)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#737373]">
                          <span>Remaining:</span>
                          <strong className="font-mono" style={{ color: CLR_LAVENDER }}>
                            {formatCurrency(
                              goal.remainingAmount != null
                                ? goal.remainingAmount
                                : Math.max(0, (Number(goal.targetAmount) || 0) - (Number(goal.savedAmount) || 0))
                            )}
                          </strong>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => triggerUploadForGoal(goal)}
                              className="text-xs text-[#737373] hover:text-[#FAFAFA] transition-colors py-1 flex items-center gap-1"
                              title="Upload goal photo"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{goalImg ? 'Photo' : 'Add Photo'}</span>
                            </button>
                            <span className="text-[#444]">•</span>
                            <button
                              type="button"
                              onClick={() => setViewingHistoryGoal(goal)}
                              className="text-xs text-[#737373] hover:text-[#FAFAFA] transition-colors py-1"
                            >
                              History
                            </button>
                          </div>
                          <GlassButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedContributionGoal(goal)}
                          >
                            + Add Money
                          </GlassButton>
                        </div>
                      </div>
                    </GlassSurface>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <GlassSurface className="p-8 text-center text-[#737373] text-sm">
            <p className="font-medium text-[#A3A3A3]">No savings goals configured yet</p>
            <p className="text-xs text-[#737373] mt-1">
              Add goals to monitor your progress toward key financial milestones with Polaroid photo tracking.
            </p>
          </GlassSurface>
        )}
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA] tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-[#737373]">Verified inflows, outflows, and reallocations</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-medium inline-flex items-center gap-1 group transition-colors"
            style={{ color: CLR_LAVENDER }}
          >
            <span>View all transactions</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>

        <GlassSurface className="p-0 overflow-hidden">
          {txStatus === 'loading' && (!transactions || transactions.length === 0) ? (
            <p className="p-8 text-center text-[#737373] text-sm">Loading recent entries…</p>
          ) : recentTransactions.length > 0 ? (
            <ul className="divide-y divide-[#292929]">
              {recentTransactions.map((tx) => {
                const isIncome   = tx.type === 'INCOME'
                const isExpense  = tx.type === 'EXPENSE'

                const iconColor  = isIncome ? CLR_INCOME : isExpense ? CLR_EXPENSE : CLR_TRANSFER
                const iconBg     = `${iconColor}1A`
                const iconBorder = `${iconColor}30`

                return (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border"
                        style={{ background: iconBg, borderColor: iconBorder, color: iconColor }}
                      >
                        {isIncome ? (
                          <TrendingUp className="w-4 h-4 text-[#70D6A3]" />
                        ) : isExpense ? (
                          <TrendingDown className="w-4 h-4 text-[#F07891]" />
                        ) : (
                          <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#FAFAFA]">
                          {tx.description || 'Untitled'}
                        </p>
                        <p className="text-xs text-[#737373] mt-0.5">
                          {new Date(tx.transactionDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {tx.categoryName ? ` • ${tx.categoryName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="font-semibold text-sm font-mono"
                        style={{ color: iconColor }}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      <p className="text-[10px] text-[#737373] tracking-wider uppercase font-semibold">
                        {tx.type}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : txStatus !== 'loading' ? (
            <div className="p-8 text-center text-[#737373]">
              <p className="text-sm font-medium text-[#A3A3A3]">No transactions found</p>
              <p className="text-xs text-[#737373] mt-1">
                Start by recording your income, expenses, or pocket transfers.
              </p>
            </div>
          ) : null}
        </GlassSurface>
      </section>

      {selectedContributionGoal && (
        <GoalContributionModal
          goal={selectedContributionGoal}
          pockets={pockets}
          onClose={() => setSelectedContributionGoal(null)}
          onSuccess={() => {
            dispatch(fetchDashboardInsights())
            dispatch(fetchPockets())
            dispatch(fetchAllTransactions())
          }}
        />
      )}

      {viewingHistoryGoal && (
        <GoalHistoryModal
          goal={viewingHistoryGoal}
          onClose={() => setViewingHistoryGoal(null)}
        />
      )}
    </div>
  )
}
