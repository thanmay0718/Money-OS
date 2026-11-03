// src/features/admin/AdminAnalyticsPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminAnalytics } from './adminSlice'
import Surface from '../../components/ui/Surface'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import {
  ChartNoAxesCombined,
  CalendarDays,
  TrendingUp,
  RefreshCw,
} from '../../components/ui/Icons'

export default function AdminAnalyticsPage() {
  const dispatch = useDispatch()
  const { analytics, analyticsStatus, analyticsError } = useSelector((state) => state.admin)
  const [days, setDays] = useState(30)

  useEffect(() => {
    dispatch(fetchAdminAnalytics(days))
  }, [dispatch, days])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val) || 0)

  const timeline = analytics?.timeline || []

  // Aggregate totals for the selected period
  const totalPeriodTx = timeline.reduce((sum, item) => sum + (item.transactionsCount || 0), 0)
  const totalPeriodIncomeVol = timeline.reduce((sum, item) => sum + (Number(item.incomeVolume) || 0), 0)
  const totalPeriodExpenseVol = timeline.reduce((sum, item) => sum + (Number(item.expenseVolume) || 0), 0)
  const totalPeriodTransferVol = timeline.reduce((sum, item) => sum + (Number(item.transferVolume) || 0), 0)
  const totalPeriodNewUsers = timeline.reduce((sum, item) => sum + (item.newUsers || 0), 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">Platform Analytics</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            Temporal activity trends, registration growth curves, and transaction throughput
          </p>
        </div>

        {/* Date Filter Range Tabs */}
        <div className="flex items-center space-x-2 bg-secondarySurface p-1 rounded-lg border border-divider">
          {[
            { label: '7 Days', value: 7 },
            { label: '14 Days', value: 14 },
            { label: '30 Days', value: 30 },
            { label: '90 Days', value: 90 },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDays(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                days === tab.value
                  ? 'bg-primaryAccent text-primaryText shadow-subtle'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => dispatch(fetchAdminAnalytics(days))}
            className="p-1.5 rounded text-mutedText hover:text-primaryText transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Surface className="p-4">
          <span className="text-xs text-mutedText uppercase tracking-wider font-semibold">
            Period Transactions
          </span>
          <p className="text-2xl font-bold text-primaryText mt-1">{totalPeriodTx.toLocaleString()}</p>
          <span className="text-[11px] text-mutedText">Last {days} days total</span>
        </Surface>

        <Surface className="p-4">
          <span className="text-xs text-mutedText uppercase tracking-wider font-semibold">
            New Registrations
          </span>
          <p className="text-2xl font-bold text-accentSoft mt-1">+{totalPeriodNewUsers}</p>
          <span className="text-[11px] text-mutedText">New accounts created</span>
        </Surface>

        <Surface className="p-4">
          <span className="text-xs text-mutedText uppercase tracking-wider font-semibold">
            Deposited Volume
          </span>
          <p className="text-2xl font-bold text-positive mt-1">{formatCurrency(totalPeriodIncomeVol)}</p>
          <span className="text-[11px] text-mutedText">Income entries</span>
        </Surface>

        <Surface className="p-4">
          <span className="text-xs text-mutedText uppercase tracking-wider font-semibold">
            Expended Volume
          </span>
          <p className="text-2xl font-bold text-negative mt-1">{formatCurrency(totalPeriodExpenseVol)}</p>
          <span className="text-[11px] text-mutedText">Expense debits</span>
        </Surface>
      </div>

      {/* Chart 1: Platform Activity Timeline (Daily Transactions) */}
      <Surface className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-primaryText">Platform Activity Timeline</h3>
            <p className="text-xs text-mutedText mt-0.5">
              Daily frequency of transaction submissions across the entire user base
            </p>
          </div>
          <span className="text-xs font-mono text-mutedText bg-secondarySurface px-2 py-1 rounded">
            {timeline.length} data points
          </span>
        </div>

        <div className="h-72 w-full">
          {analyticsStatus === 'loading' ? (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              Loading activity timeline…
            </div>
          ) : timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#E2E8F0',
                  }}
                  formatter={(val) => [val, 'Transactions Recorded']}
                />
                <Area
                  type="monotone"
                  dataKey="transactionsCount"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#txGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              No activity records available for this period.
            </div>
          )}
        </div>
      </Surface>

      {/* Chart 2: Transaction Throughput Volume Trends (Income, Expense, Transfer) */}
      <Surface className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-primaryText">Transaction Volume Trends</h3>
            <p className="text-xs text-mutedText mt-0.5">
              Daily volume broken down into Income deposits, Expense outflows, and Inter-pocket transfers (INR)
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          {analyticsStatus === 'loading' ? (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              Loading volume trends…
            </div>
          ) : timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#E2E8F0',
                  }}
                  formatter={(val, name) => [
                    formatCurrency(val),
                    name === 'incomeVolume'
                      ? 'Income Deposits'
                      : name === 'expenseVolume'
                      ? 'Expense Debits'
                      : 'Inter-Pocket Transfers',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) =>
                    value === 'incomeVolume'
                      ? 'Income'
                      : value === 'expenseVolume'
                      ? 'Expense'
                      : 'Transfer'
                  }
                />
                <Bar dataKey="incomeVolume" fill="#34D399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenseVolume" fill="#F87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="transferVolume" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              No volume trends available.
            </div>
          )}
        </div>
      </Surface>

      {/* Chart 3: User Growth Analytics */}
      <Surface className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-primaryText">User Growth & Registration Trend</h3>
            <p className="text-xs text-mutedText mt-0.5">
              Daily new user onboardings over the selected measurement window
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {analyticsStatus === 'loading' ? (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              Loading registration trends…
            </div>
          ) : timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: 'rgba(148,163,184,0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#E2E8F0',
                  }}
                  formatter={(val) => [val, 'New Users']}
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#818CF8"
                  strokeWidth={2}
                  fill="url(#userGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-mutedText">
              No registration data available.
            </div>
          )}
        </div>
      </Surface>
    </div>
  )
}
