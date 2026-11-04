// src/features/dashboard/Dashboard.jsx — Phase 1 & Phase 2 Core + Smart Financial Management
import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchPockets } from '../pockets/pocketsSlice'
import { fetchAllTransactions } from '../transactions/transactionsSlice'
import {
  fetchDashboardInsights,
  fetchDashboardSummary,
  fetchEmergencyFund,
} from './dashboardSlice'
import {
  GlassSurface,
  GlassPanel,
  GlassButton,
  GlassBadge,
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
  SlidersHorizontal,
  ListOrdered,
  Sparkles,
  Eye,
  EyeOff,
  Info,
  Wallet,
  CalendarDays,
  Shield,
  Landmark,
  ArrowRight,
} from '../../components/ui/Icons'
import { toast } from '../../lib/toast'
import CashFlowChart from '../../components/charts/CashFlowChart'
import ExpenseBreakdownDonut from '../../components/charts/ExpenseBreakdownDonut'
import RecentTransactionsTable from './components/RecentTransactionsTable'
import DashboardPocketsWidget from './components/DashboardPocketsWidget'
import MonthlyBudgetSection from './components/MonthlyBudgetSection'
import UpcomingBillsWidget from './components/UpcomingBillsWidget'
import EmergencyFundWidget from './components/EmergencyFundWidget'
import NetWorthTrackerWidget from './components/NetWorthTrackerWidget'
import { createGoal as createFinancialGoal } from '../../api/goals'
import GoalContributionModal from '../goals/GoalContributionModal'
import GoalHistoryModal from '../goals/GoalHistoryModal'
import PolaroidLineCarousel from '../../components/ui/polaroid-line-carousel'

// Semantic financial colors
const CLR_INCOME   = '#70D6A3' // emerald/green
const CLR_EXPENSE  = '#F07891' // rose/pink
const CLR_TRANSFER = '#86B8F5' // ice blue
const CLR_LAVENDER = '#C3ABFA' // champagne/lavender

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { list: pockets } = useSelector((state) => state.pockets)
  const { list: transactions, status: txStatus } = useSelector((state) => state.transactions)
  const {
    budgetSuggestion,
    goalProgress,
    summary,
    status: insightsStatus,
    error: insightsError,
  } = useSelector((state) => state.dashboard)
  const user = useSelector((state) => state.auth.user)

  // Top overview UI state
  const [showBalance, setShowBalance] = useState(true)
  const [showSavingsRateTooltip, setShowSavingsRateTooltip] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // Savings goals state
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    savedAmount: '',
    targetDate: '',
    priority: 'MEDIUM',
  })
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

  const currencyCode = summary?.currency || budgetSuggestion?.currency || user?.currency || 'INR'

  useEffect(() => {
    dispatch(fetchPockets())
    dispatch(fetchAllTransactions())
    dispatch(fetchDashboardInsights())
    dispatch(fetchDashboardSummary())
    dispatch(fetchEmergencyFund(6))
  }, [dispatch])

  // Fallback calculations in case backend summary is pending
  const fallbackPocketsBalance = useMemo(() => {
    if (!Array.isArray(pockets)) return 0
    return pockets.reduce((acc, p) => acc + (Number(p.balance ?? p.currentBalance) || 0), 0)
  }, [pockets])

  const { fallbackIncome, fallbackExpenses } = useMemo(() => {
    let inc = 0
    let exp = 0
    if (Array.isArray(transactions)) {
      transactions.forEach((tx) => {
        const amt = Number(tx.amount) || 0
        if (tx.type === 'INCOME') inc += amt
        if (tx.type === 'EXPENSE') exp += amt
      })
    }
    return { fallbackIncome: inc, fallbackExpenses: exp }
  }, [transactions])

  // Authoritative metrics prioritizing backend BigDecimal calculations
  const totalBalance = summary?.totalBalance != null ? Number(summary.totalBalance) : fallbackPocketsBalance
  const monthlyIncome = summary?.monthlyIncome != null ? Number(summary.monthlyIncome) : fallbackIncome
  const monthlyExpenses = summary?.monthlyExpenses != null ? Number(summary.monthlyExpenses) : fallbackExpenses
  const netCashFlow = monthlyIncome - monthlyExpenses
  const savingsRate =
    summary?.savingsRate != null
      ? Number(summary.savingsRate)
      : monthlyIncome > 0
      ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
      : 0

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return '—'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value)
  }

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
        priority: goalForm.priority || 'MEDIUM',
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

      setGoalForm({ title: '', targetAmount: '', savedAmount: '', targetDate: '', priority: 'MEDIUM' })
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
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
              Live Core
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            Real-time financial status, smart budget controls &amp; balance sheet intelligence
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

      {/* Error banner if insights failed */}
      {insightsStatus === 'failed' && insightsError && (
        <div className="p-3.5 rounded-2xl glass-surface border-[#F07891]/30 bg-[#F07891]/[0.06] text-[#F07891] text-xs flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-[#F07891]" />
          <span>Unable to refresh server insights: {insightsError}. Displaying locally cached data.</span>
        </div>
      )}

      {/* ── PHASE 1: FINANCIAL OVERVIEW CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Total Balance */}
        <div
          onClick={() => navigate('/pockets')}
          className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(195, 171, 250, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#C3ABFA]" />
              Total Balance
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowBalance(!showBalance)
              }}
              title={showBalance ? 'Hide balance' : 'Show balance'}
              className="p-1 rounded-lg text-[#737373] hover:text-white transition-colors"
            >
              {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA] font-mono">
              {showBalance ? formatCurrency(totalBalance) : '••••••••'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-white/[0.04] pt-2">
            <span className="text-[#737373]">
              {pockets?.length || 0} active {pockets?.length === 1 ? 'pocket' : 'pockets'}
            </span>
            {summary?.balanceChangePercent != null && (
              <span
                className={`inline-flex items-center font-medium ${
                  Number(summary.balanceChangePercent) >= 0 ? 'text-[#70D6A3]' : 'text-[#F07891]'
                }`}
              >
                {Number(summary.balanceChangePercent) >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {Number(summary.balanceChangePercent) >= 0 ? '+' : ''}
                {Number(summary.balanceChangePercent).toFixed(1)}% vs last mo
              </span>
            )}
          </div>
        </div>

        {/* Card B: Monthly Income */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(112, 214, 163, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#70D6A3]" />
              Monthly Income
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: CLR_INCOME, boxShadow: `0 0 6px ${CLR_INCOME}` }}
            />
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-[#70D6A3]">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-white/[0.04] pt-2">
            <span className="text-[#737373]">Verified inflows</span>
            {summary?.incomeChangePercent != null ? (
              <span
                className={`inline-flex items-center font-medium ${
                  Number(summary.incomeChangePercent) >= 0 ? 'text-[#70D6A3]' : 'text-[#F07891]'
                }`}
              >
                {Number(summary.incomeChangePercent) >= 0 ? '+' : ''}
                {Number(summary.incomeChangePercent).toFixed(1)}% vs prev
              </span>
            ) : (
              <span className="text-[#737373]">Current month</span>
            )}
          </div>
        </div>

        {/* Card C: Monthly Expenses */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(240, 120, 145, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#F07891]" />
              Monthly Expenses
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: CLR_EXPENSE, boxShadow: `0 0 6px ${CLR_EXPENSE}` }}
            />
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-[#F07891]">
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-white/[0.04] pt-2">
            <span className="text-[#737373]">Excludes transfers</span>
            {summary?.expenseChangePercent != null ? (
              <span
                className={`inline-flex items-center font-medium ${
                  Number(summary.expenseChangePercent) <= 0 ? 'text-[#70D6A3]' : 'text-[#F07891]'
                }`}
              >
                {Number(summary.expenseChangePercent) > 0 ? '+' : ''}
                {Number(summary.expenseChangePercent).toFixed(1)}% vs prev
              </span>
            ) : (
              <span className="text-[#737373]">Current month</span>
            )}
          </div>
        </div>

        {/* Card D: Savings Rate */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(195, 171, 250, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
                Savings Rate
              </span>
              <button
                type="button"
                onMouseEnter={() => setShowSavingsRateTooltip(true)}
                onMouseLeave={() => setShowSavingsRateTooltip(false)}
                className="text-[#737373] hover:text-white"
                title="Financial calculation info"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                savingsRate >= 20
                  ? 'bg-[#70D6A3]/15 text-[#70D6A3]'
                  : savingsRate >= 10
                  ? 'bg-[#C3ABFA]/15 text-[#D5C5FF]'
                  : savingsRate >= 0
                  ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                  : 'bg-[#F07891]/15 text-[#F07891]'
              }`}
            >
              {savingsRate >= 20
                ? 'Optimal'
                : savingsRate >= 10
                ? 'Healthy'
                : savingsRate >= 0
                ? 'Moderate'
                : 'Deficit'}
            </span>
          </div>

          <div className="my-3">
            <p
              className="text-2xl sm:text-3xl font-bold tracking-tight font-mono"
              style={{
                color: savingsRate >= 0 ? CLR_LAVENDER : CLR_EXPENSE,
              }}
            >
              {monthlyIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0.0%'}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-white/[0.04] pt-2">
            <span className="text-[#737373]">Net: {formatCurrency(netCashFlow)}</span>
            {summary?.savingsRateChangePercent != null && (
              <span
                className={`inline-flex items-center font-medium ${
                  Number(summary.savingsRateChangePercent) >= 0 ? 'text-[#70D6A3]' : 'text-[#F07891]'
                }`}
              >
                {Number(summary.savingsRateChangePercent) >= 0 ? '+' : ''}
                {Number(summary.savingsRateChangePercent).toFixed(1)}%
              </span>
            )}
          </div>

          {/* Savings Rate Explanatory Tooltip */}
          {showSavingsRateTooltip && (
            <div className="absolute inset-x-2 bottom-2 p-2.5 rounded-xl bg-[#1A1A1A] border border-white/10 text-[10px] text-[#A3A3A3] shadow-xl z-20">
              <p className="font-semibold text-white mb-0.5">Formula:</p>
              <p>(Income - Expenses) / Income × 100</p>
              <p className="mt-1 text-[9px] text-[#737373]">
                Transfers between pockets are excluded.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── PHASE 1: CASH FLOW ANALYTICS & EXPENSE BREAKDOWN ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between min-h-[340px]">
          <CashFlowChart
            transactions={transactions}
            currencyCode={currencyCode}
            backendTrends={summary?.cashFlowTrends}
          />
        </div>

        <div className="lg:col-span-5 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">
                Expense Breakdown
              </h3>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-[11px] text-[#C3ABFA] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#737373] mb-3">
              Distribution across verified expense categories
            </p>
          </div>
          <ExpenseBreakdownDonut
            categories={summary?.topExpenseCategories}
            currencyCode={currencyCode}
            totalExpenses={monthlyExpenses}
            onSelectCategory={(catName) => {
              setSelectedCategory(selectedCategory === catName ? null : catName)
            }}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>

      {/* ── PHASE 2: TASK 2.1 — MONTHLY BUDGET MANAGEMENT ────────────────────── */}
      <section>
        <MonthlyBudgetSection currencyCode={currencyCode} />
      </section>

      {/* ── PHASE 2: TASK 2.2 & 2.3 — UPCOMING BILLS & RECURRING COMMITMENTS ─── */}
      <section>
        <UpcomingBillsWidget currencyCode={currencyCode} />
      </section>

      {/* ── PHASE 2: TASK 2.5 — EMERGENCY FUND SAFETY SHIELD ─────────────────── */}
      <section>
        <EmergencyFundWidget currencyCode={currencyCode} />
      </section>

      {/* ── PHASE 2: TASK 2.6 — NET WORTH & BALANCE SHEET ────────────────────── */}
      <section>
        <NetWorthTrackerWidget currencyCode={currencyCode} />
      </section>

      {/* ── PHASE 1: TASK 1.5 — MONEY POCKETS OVERVIEW ───────────────────────── */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <DashboardPocketsWidget
          pockets={pockets}
          currencyCode={currencyCode}
          totalBalance={totalBalance}
        />
      </div>

      {/* ── PHASE 2: TASK 2.4 — FINANCIAL GOALS ENHANCED ─────────────────────── */}
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

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-[#FAFAFA] tracking-tight">
                Savings Goals &amp; Milestones
              </h2>
              {goalProgress && goalProgress.length > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
                  {goalProgress.length} {goalProgress.length === 1 ? 'Goal' : 'Goals'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373]">
              Active milestones, instant Polaroid prints, priority tracking &amp; atomic contributions
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:justify-end">
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
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setGoalError('')
                setGoalImagePreview(null)
                setShowGoalForm(!showGoalForm)
              }}
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
              />

              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1.5">
                  Goal Priority
                </label>
                <select
                  value={goalForm.priority}
                  onChange={(e) => setGoalForm((c) => ({ ...c, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

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
                  <GlassButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowGoalForm(false)
                      setGoalImagePreview(null)
                    }}
                  >
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
                <GlassPanel className="p-2 sm:p-4 overflow-hidden relative border-white/10 bg-gradient-to-b from-[#181818]/90 to-[#121212]/95 shadow-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 pt-2 pb-1 text-xs text-[#737373]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C3ABFA] animate-pulse" />
                      <span className="font-medium text-[#A3A3A3]">Interactive Clothesline</span>
                    </div>
                    <span className="text-[11px] text-right">
                      Drag line or click prints • Print {activeGoalIndex + 1} of {goalProgress.length}
                    </span>
                  </div>

                  <PolaroidLineCarousel
                    height={460}
                    cardWidth={220}
                    sag={36}
                    swing={1}
                    autoplay={0}
                    string="rgba(195, 171, 250, 0.45)"
                    background="transparent"
                    ink="#181818"
                    onChange={(idx) => setActiveGoalIndex(idx)}
                    slides={goalProgress.map((g, idx) => {
                      const pct = Math.min(
                        100,
                        Math.round(((Number(g.savedAmount) || 0) / (Number(g.targetAmount) || 1)) * 100)
                      )
                      const customImg = goalImages[g.id] || goalImages[g.title]
                      const palettes = ['dawn', 'alpine', 'dusk', 'mist']
                      const chosenPalette = palettes[idx % palettes.length]

                      return {
                        image: customImg || undefined,
                        palette: chosenPalette,
                        seed: 100 + idx * 77,
                        title: g.title,
                        caption: `${pct}% • ${formatCurrency(g.savedAmount)} / ${formatCurrency(
                          g.targetAmount
                        )}`,
                        alt: g.title,
                      }
                    })}
                  />

                  {/* Active Goal Quick Action Dock below carousel */}
                  {goalProgress[activeGoalIndex] && (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3 px-3 pb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C3ABFA] shadow-[0_0_8px_#C3ABFA]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#FAFAFA]">
                              {goalProgress[activeGoalIndex].title}
                            </p>
                            {goalProgress[activeGoalIndex].priority && (
                              <span
                                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                                  goalProgress[activeGoalIndex].priority === 'HIGH'
                                    ? 'bg-[#F07891]/15 text-[#F07891] border-[#F07891]/30'
                                    : 'bg-white/[0.06] text-[#A3A3A3] border-white/10'
                                }`}
                              >
                                {goalProgress[activeGoalIndex].priority} Priority
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#737373]">
                            Saved {formatCurrency(goalProgress[activeGoalIndex].savedAmount)} of{' '}
                            {formatCurrency(goalProgress[activeGoalIndex].targetAmount)}
                            {goalProgress[activeGoalIndex].recommendedMonthlyContribution && (
                              <span className="text-[#C3ABFA] ml-2">
                                • Suggested: {formatCurrency(goalProgress[activeGoalIndex].recommendedMonthlyContribution)}/mo
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => triggerUploadForGoal(goalProgress[activeGoalIndex])}
                          className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-1.5"
                          title="Upload photo for this Polaroid"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {goalImages[goalProgress[activeGoalIndex].id] ||
                            goalImages[goalProgress[activeGoalIndex].title]
                              ? 'Change Photo'
                              : 'Add Photo'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingHistoryGoal(goalProgress[activeGoalIndex])}
                          className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#A3A3A3] hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                          History
                        </button>
                        <GlassButton
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedContributionGoal(goalProgress[activeGoalIndex])}
                        >
                          + Add Money
                        </GlassButton>
                      </div>
                    </div>
                  )}
                </GlassPanel>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalProgress.map((goal) => {
                  const saved = Number(goal.savedAmount) || 0
                  const target = Number(goal.targetAmount) || 1
                  const pct = Math.min(100, Math.round((saved / target) * 100))
                  const goalImg = goalImages[goal.id] || goalImages[goal.title]

                  return (
                    <GlassSurface key={goal.id} className="p-4 flex flex-col justify-between overflow-hidden group">
                      {goalImg && (
                        <div className="w-full h-32 rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                          <img
                            src={goalImg}
                            alt={goal.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-sm text-[#FAFAFA]">{goal.title}</h3>
                            {goal.priority && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white/[0.05] text-[#A3A3A3]">
                                {goal.priority}
                              </span>
                            )}
                          </div>
                          <GlassBadge variant={pct >= 100 ? 'positive' : 'accent'} size="sm">
                            {pct}%
                          </GlassBadge>
                        </div>
                        <p className="text-xs text-[#737373] mt-0.5">
                          {formatCurrency(goal.savedAmount)} saved
                        </p>
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-3 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: CLR_LAVENDER }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#737373]">
                          <span>Target:</span>
                          <strong className="text-[#A3A3A3] font-mono">{formatCurrency(goal.targetAmount)}</strong>
                        </div>
                        {goal.recommendedMonthlyContribution && (
                          <div className="flex items-center justify-between text-xs text-[#C3ABFA]">
                            <span>Recommended:</span>
                            <span className="font-mono">{formatCurrency(goal.recommendedMonthlyContribution)}/mo</span>
                          </div>
                        )}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => triggerUploadForGoal(goal)}
                            className="text-xs text-[#737373] hover:text-[#FAFAFA] py-1 flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{goalImg ? 'Photo' : 'Add Photo'}</span>
                          </button>
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

      {/* ── PHASE 1: TASK 1.4 — RECENT TRANSACTIONS TABLE ───────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#FAFAFA] tracking-tight">
              Recent Transactions
            </h2>
            <p className="text-xs text-[#737373]">
              Real-time audit log of inflows, verified expenses &amp; pocket transfers
            </p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-medium inline-flex items-center gap-1 group transition-colors text-[#C3ABFA] hover:text-white"
          >
            <span>Full Ledger</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <RecentTransactionsTable
            transactions={transactions}
            currencyCode={currencyCode}
            filterCategory={selectedCategory}
            onClearCategoryFilter={() => setSelectedCategory(null)}
          />
        </div>
      </section>

      {/* Contribution & History Modals */}
      {selectedContributionGoal && (
        <GoalContributionModal
          goal={selectedContributionGoal}
          pockets={pockets}
          onClose={() => setSelectedContributionGoal(null)}
          onSuccess={() => {
            dispatch(fetchDashboardInsights())
            dispatch(fetchDashboardSummary())
            dispatch(fetchPockets())
            dispatch(fetchAllTransactions())
            dispatch(fetchEmergencyFund(6))
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
